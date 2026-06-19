import {
  COLLECTION_PRODUCTS_QUERY,
  CATALOG_PRODUCT_FRAGMENT,
  PACKAGE_COLLECTIONS_QUERY,
} from '~/graphql/storefront/CatalogProductsQuery';
import type {Storefront} from '@shopify/hydrogen';
import {
  DIFFICULTY_FILTERS,
  DURATION_FILTERS,
  GEAR_FILTERS,
  TREK_FILTERS,
  type GearItem,
  type PackageItem,
} from '~/lib/trailrent/catalog';
import {collectProductMediaImageUrls} from '~/lib/trailrent/catalog-image';
import {formatGel} from '~/lib/trailrent/pricing';
import {liveStorefrontCache} from '~/lib/trailrent/storefront-live';
import {
  parseGearBuilderMetafields,
  capacityFromVariantTitle,
  calculatePackagePricing,
  DURATION_DAYS,
  type GearBuilderProduct,
  type PackageDuration,
} from '~/lib/trailrent/gear-builder';
import {
  filterRentVariants,
  pickRentVariant,
  collectProductVariants,
  type FulfillmentVariantNode,
} from '~/lib/trailrent/product-variants';

/** Create these collections in Shopify Admin and add products. */
export const SHOPIFY_COLLECTION_HANDLES = {
  /** Legacy listing collection — not a kit package itself. */
  packages: 'trail-packages',
  gear: 'individual-gear',
} as const;

/** Parent/listing collections — excluded from package kit discovery. */
export const PACKAGE_LISTING_HANDLES = new Set([
  SHOPIFY_COLLECTION_HANDLES.packages,
  'frontpage',
]);

export type PackageCollectionNode = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  image?: {
    url: string;
    altText?: string | null;
  } | null;
  themeTemplate?: {value?: string | null} | null;
  isPackage?: {value?: string | null} | null;
  trekMeta?: {value?: string | null} | null;
  durationMeta?: {value?: string | null} | null;
  difficultyMeta?: {value?: string | null} | null;
  products?: {
    nodes: CatalogProductNode[];
  } | null;
};

export type HomepageFeaturedItem = {
  id: string;
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  imageUrls?: string[];
  dailyRate: number;
  compareAt?: number;
  url: string;
};

/** Handle for the Shopify collection that lists this package's included gear. */
export function packageIncludesCollectionHandle(packageHandle: string): string {
  return `${packageHandle}-includes`;
}

/** Reverse of packageIncludesCollectionHandle — kit collection → package product PDP. */
export function packageProductHandleFromKitCollection(
  kitCollectionHandle: string,
): string | null {
  const suffix = '-includes';
  if (kitCollectionHandle.endsWith(suffix)) {
    return kitCollectionHandle.slice(0, -suffix.length);
  }
  return null;
}

export function resolvePackageItemUrl(
  pkg: Pick<
    ShopifyPackageItem,
    'productHandle' | 'catalogUrl' | 'includedCollectionHandle'
  >,
): string | null {
  const fromConvention = pkg.includedCollectionHandle
    ? packageProductHandleFromKitCollection(pkg.includedCollectionHandle)
    : null;
  const productHandle =
    pkg.productHandle && !pkg.productHandle.endsWith('-includes')
      ? pkg.productHandle
      : fromConvention;

  if (productHandle) return `/products/${productHandle}`;

  if (pkg.catalogUrl && !pkg.catalogUrl.startsWith('/collections/')) {
    return pkg.catalogUrl;
  }

  return null;
}

export type CatalogProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  featuredImage?: {
    url: string;
    altText?: string | null;
  } | null;
  media?: {
    nodes: Array<{
      id?: string;
      image?: {
        url: string;
        altText?: string | null;
      } | null;
    }>;
  } | null;
  priceRange: {
    minVariantPrice: {amount: string; currencyCode: string};
  };
  compareAtPriceRange?: {
    minVariantPrice: {amount: string; currencyCode: string};
  } | null;
  selectedOrFirstAvailableVariant?: {
    id: string;
    availableForSale: boolean;
    title?: string | null;
    price: {amount: string; currencyCode: string};
    compareAtPrice?: {amount: string; currencyCode: string} | null;
    selectedOptions?: Array<{name: string; value: string}>;
  } | null;
  variants?: {
    nodes: FulfillmentVariantNode[];
  } | null;
  availableForPurchase?: {value: string} | null;
  includedItems?: {value: string; type: string} | null;
  includedProductHandles?: {value: string} | null;
  kitSummary?: {value: string} | null;
  gearItemType?: {value: string} | null;
  gearBuilderEnabled?: {value: string} | null;
  gearCapacityLiters?: {value: string} | null;
  gearCapacityClass?: {value: string} | null;
  gearDurationFit?: {value: string} | null;
  gearThumbnailPriority?: {value: string} | null;
  includedCollection?: {
    value?: string;
    reference?: {
      handle?: string;
      image?: {
        url: string;
        altText?: string | null;
      } | null;
      products?: {
        nodes: CatalogProductNode[];
      };
    } | null;
  } | null;
};

export type ShopifyPackageItem = PackageItem & {
  productId: string;
  variantId?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageUrls: string[];
  compareAtPrice?: number;
  savingsPercent?: number;
  /** PDP or collection URL for this package card. */
  catalogUrl?: string;
  /** @deprecated Prefer includedCollectionProducts — kept for legacy metafield fallback */
  includedProductHandles: string[];
  includedCollectionHandle?: string;
  includedCollectionProducts: GearBuilderProduct[];
  defaultDuration: PackageDuration;
};

export type ShopifyGearItem = GearItem & {
  productId: string;
  variantId?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageUrls: string[];
  compareAtPrice?: number;
  savingsPercent?: number;
  builderProduct: GearBuilderProduct;
};

function tagValue(tags: string[], prefix: string): string | undefined {
  const match = tags.find((t) => t.startsWith(`${prefix}-`));
  return match?.slice(prefix.length + 1);
}

function labelFromFilter(
  value: string | undefined,
  filters: readonly {value: string; labelKa: string; labelEn: string}[],
  locale: 'ka' | 'en',
): string {
  if (!value) return '';
  const hit = filters.find((f) => f.value === value);
  if (!hit) return value;
  return locale === 'ka' ? hit.labelKa : hit.labelEn;
}

function parseIncludedItems(metafield?: {value: string; type: string} | null): string[] {
  if (!metafield?.value) return [];
  try {
    const parsed = JSON.parse(metafield.value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    // fall through — treat as newline list
  }
  return metafield.value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseIncludedProductHandles(metafield?: {value: string} | null): string[] {
  if (!metafield?.value) return [];
  try {
    const parsed = JSON.parse(metafield.value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    // fall through
  }
  return metafield.value
    .split(/[,\n]/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function catalogRentVariant(product: CatalogProductNode) {
  const variants = collectProductVariants({
    variants: product.variants,
    selectedOrFirstAvailableVariant: product.selectedOrFirstAvailableVariant,
  });
  return pickRentVariant(variants) ?? product.selectedOrFirstAvailableVariant;
}

function inferGearCategory(product: CatalogProductNode): string {
  const tagged = tagValue(product.tags, 'gear');
  if (tagged) return tagged;

  const haystack = `${product.title} ${product.handle}`.toLowerCase();
  if (haystack.includes('ჯოხ') || haystack.includes('pole')) return 'poles';
  if (
    haystack.includes('ფეხსაცმ') ||
    haystack.includes('shoe') ||
    haystack.includes('boot')
  ) {
    return 'shoes';
  }
  if (haystack.includes('კარავ') || haystack.includes('tent')) return 'tent';
  if (haystack.includes('ჩანთ') || haystack.includes('backpack')) {
    return 'backpack';
  }
  if (haystack.includes('საძილ') || haystack.includes('sleeping')) {
    return 'sleeping';
  }

  return 'other';
}

async function loadKitCollectionProducts(
  storefront: Storefront,
  handle: string,
): Promise<{products: GearBuilderProduct[]; collectionImageUrl?: string}> {
  if (!handle.trim()) return {products: []};

  const {collection} = await storefront
    .query(COLLECTION_PRODUCTS_QUERY, {
      variables: {handle, first: 50},
      ...liveStorefrontCache(storefront),
    })
    .catch(() => ({collection: null}));

  const nodes = (collection?.products?.nodes ?? []) as CatalogProductNode[];
  return {
    products: nodes.map((node) => mapGearBuilderProduct(node)),
    collectionImageUrl: collection?.image?.url,
  };
}

function includedCollectionImageUrl(
  product: CatalogProductNode,
): string | undefined {
  return product.includedCollection?.reference?.image?.url ?? undefined;
}

function hasIncludedCollectionMetafield(product: CatalogProductNode): boolean {
  return Boolean(
    product.includedCollection?.value?.trim() ||
      product.includedCollection?.reference?.handle,
  );
}

/** Metafield-linked kit collection is source of truth; convention handle is last resort. */
export async function resolvePackageKitProducts(
  storefront: Storefront,
  product: CatalogProductNode,
): Promise<{
  handle?: string;
  products: GearBuilderProduct[];
  collectionImageUrl?: string;
}> {
  const embedded = extractIncludedCollectionProducts(product);
  if (embedded.products.length > 0) {
    return {
      ...embedded,
      collectionImageUrl: includedCollectionImageUrl(product),
    };
  }

  const metafieldHandle = product.includedCollection?.reference?.handle?.trim();
  if (metafieldHandle) {
    const fromMetafield = await loadKitCollectionProducts(
      storefront,
      metafieldHandle,
    );
    if (fromMetafield.products.length > 0) {
      return {
        handle: metafieldHandle,
        products: fromMetafield.products,
        collectionImageUrl: fromMetafield.collectionImageUrl,
      };
    }
  }

  if (!hasIncludedCollectionMetafield(product)) {
    const conventionHandle = packageIncludesCollectionHandle(product.handle);
    const fromConvention = await loadKitCollectionProducts(
      storefront,
      conventionHandle,
    );
    if (fromConvention.products.length > 0) {
      return {
        handle: conventionHandle,
        products: fromConvention.products,
        collectionImageUrl: fromConvention.collectionImageUrl,
      };
    }
  }

  return {handle: metafieldHandle, products: []};
}

export function mapCatalogNodeToGearBuilderProduct(
  product: CatalogProductNode,
): GearBuilderProduct {
  return mapGearBuilderProduct(product);
}

function collectPackageCardImages(
  product: CatalogProductNode,
  kitProducts: GearBuilderProduct[],
  collectionImageUrl?: string,
): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  const add = (url?: string | null) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    urls.push(url);
  };

  add(product.featuredImage?.url);
  for (const node of product.media?.nodes ?? []) {
    add(node.image?.url);
  }
  add(collectionImageUrl ?? includedCollectionImageUrl(product));
  for (const kit of kitProducts) {
    add(kit.imageUrl);
  }

  return urls;
}

function mapGearBuilderProduct(product: CatalogProductNode): GearBuilderProduct {
  const allVariantNodes = product.variants?.nodes ?? [];
  const rentVariantNodes = filterRentVariants(allVariantNodes);
  const variant = pickRentVariant(
    rentVariantNodes.length ? rentVariantNodes : allVariantNodes,
  );
  const variants = (rentVariantNodes.length ? rentVariantNodes : allVariantNodes).map(
    (entry) => ({
      id: entry.id,
      title: entry.title ?? '',
      availableForSale: entry.availableForSale !== false,
      price: Number(entry.price.amount),
      capacityLiters: capacityFromVariantTitle(entry.title ?? ''),
    }),
  );

  const metafields = parseGearBuilderMetafields({
    itemType: product.gearItemType?.value,
    builderEnabled: product.gearBuilderEnabled?.value,
    capacityLiters: product.gearCapacityLiters?.value,
    capacityClass: product.gearCapacityClass?.value,
    durationFit: product.gearDurationFit?.value,
    thumbnailPriority: product.gearThumbnailPriority?.value,
  });

  if (!product.gearBuilderEnabled?.value && !product.gearItemType?.value) {
    const category = inferGearCategory(product);
    if (category && category !== 'other') {
      metafields.itemType =
        category === 'sleeping'
          ? 'sleeping_bag'
          : category === 'electronics'
            ? 'lighting'
            : category === 'poles'
              ? 'other'
              : (category as GearBuilderProduct['metafields']['itemType']);
      metafields.builderEnabled = category !== 'poles';
    }
  }

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    imageUrl: product.featuredImage?.url,
    imageAlt: product.featuredImage?.altText ?? product.title,
    dailyRate: Number(variant?.price.amount ?? product.priceRange.minVariantPrice.amount),
    variantId: variant?.id,
    availableForSale: variant?.availableForSale !== false,
    metafields,
    variants,
  };
}

function extractIncludedCollectionProducts(
  product: CatalogProductNode,
): {handle?: string; products: GearBuilderProduct[]} {
  const reference = product.includedCollection?.reference;
  const nodes = reference?.products?.nodes ?? [];
  if (!nodes.length) {
    return {handle: reference?.handle, products: []};
  }
  return {
    handle: reference?.handle,
    products: nodes.map((node) => mapGearBuilderProduct(node)),
  };
}

function packageRentDailyRatesFromProducts(
  products: GearBuilderProduct[],
): number[] {
  return products.map((product) => product.dailyRate).filter((rate) => rate > 0);
}

export function packageRentDailyRatesFromCatalogNodes(
  nodes: CatalogProductNode[],
): number[] {
  return packageRentDailyRatesFromProducts(
    nodes.map((node) => mapGearBuilderProduct(node)),
  );
}

export function resolvePackagePricingFromCatalog(
  nodes: CatalogProductNode[],
  duration: PackageDuration,
) {
  const rentDailyRates = packageRentDailyRatesFromCatalogNodes(nodes);
  if (!rentDailyRates.length) return null;
  return calculatePackagePricing(rentDailyRates, DURATION_DAYS[duration]);
}

export async function resolveIncludedKitNodes(
  storefront: Storefront,
  product: CatalogProductNode & {tags?: string[]},
  _handle: string,
): Promise<CatalogProductNode[]> {
  const isPackage = (product.tags ?? []).some((tag: string) =>
    tag.startsWith('trek-'),
  );
  if (!isPackage) return [];

  const embedded = (product.includedCollection?.reference?.products?.nodes ??
    []) as CatalogProductNode[];
  if (embedded.length > 0) return embedded;

  const metafieldHandle = product.includedCollection?.reference?.handle?.trim();
  if (metafieldHandle) {
    const {collection} = await storefront
      .query(COLLECTION_PRODUCTS_QUERY, {
        variables: {handle: metafieldHandle, first: 50},
        ...liveStorefrontCache(storefront),
      })
      .catch(() => ({collection: null}));

    const fromMetafield = (collection?.products?.nodes ??
      []) as CatalogProductNode[];
    if (fromMetafield.length > 0) return fromMetafield;
  }

  if (!hasIncludedCollectionMetafield(product)) {
    const conventionHandle = packageIncludesCollectionHandle(product.handle);
    const {collection} = await storefront
      .query(COLLECTION_PRODUCTS_QUERY, {
        variables: {handle: conventionHandle, first: 50},
        ...liveStorefrontCache(storefront),
      })
      .catch(() => ({collection: null}));

    return (collection?.products?.nodes ?? []) as CatalogProductNode[];
  }

  return [];
}

function mapPackageProduct(
  product: CatalogProductNode,
  locale: 'ka' | 'en',
  includedFromCollection?: GearBuilderProduct[],
  includedCollectionHandle?: string,
  kitCollectionImageUrl?: string,
): ShopifyPackageItem {
  const trek = tagValue(product.tags, 'trek') ?? 'tobavarchkhili';
  const duration = (tagValue(product.tags, 'duration') ?? '2-day') as PackageDuration;
  const difficulty = tagValue(product.tags, 'difficulty') ?? 'moderate';

  const variant = catalogRentVariant(product);
  const variantDailyRate = Number(
    variant?.price.amount ?? product.priceRange.minVariantPrice.amount,
  );
  const variantCompareAt = Number(
    variant?.compareAtPrice?.amount ??
      product.compareAtPriceRange?.minVariantPrice.amount ??
      0,
  );

  const itemsFromMetafield = parseIncludedItems(product.includedItems);
  const summary = product.kitSummary?.value ?? product.description;
  const embeddedCollection = extractIncludedCollectionProducts(product);
  const includedCollectionProducts =
    includedFromCollection?.length
      ? includedFromCollection
      : embeddedCollection.products;
  const resolvedCollectionHandle =
    includedCollectionHandle ??
    embeddedCollection.handle ??
    (includedCollectionProducts.length
      ? packageIncludesCollectionHandle(product.handle)
      : undefined);
  const includedProductHandles =
    includedCollectionProducts.length > 0
      ? includedCollectionProducts.map((entry) => entry.handle)
      : parseIncludedProductHandles(product.includedProductHandles);
  const items =
    includedCollectionProducts.length > 0
      ? includedCollectionProducts.map((entry) => entry.title)
      : itemsFromMetafield;

  const packagePricing = includedCollectionProducts.length
    ? calculatePackagePricing(
        packageRentDailyRatesFromProducts(includedCollectionProducts),
        DURATION_DAYS[duration],
      )
    : null;
  const dailyRate = packagePricing?.bundleDaily ?? variantDailyRate;
  const compareAt =
    packagePricing?.subtotalDaily ??
    (variantCompareAt > 0 ? variantCompareAt : undefined);

  const savingsPercent =
    compareAt != null && compareAt > dailyRate && compareAt > 0
      ? Math.round(((compareAt - dailyRate) / compareAt) * 100)
      : undefined;

  const collectionImageUrl =
    kitCollectionImageUrl ?? includedCollectionImageUrl(product);

  return {
    id: product.id,
    title: product.title,
    description: summary,
    priceLabel: `${formatGel(dailyRate)} / ${locale === 'ka' ? 'დღე' : 'day'}`,
    dailyRate,
    currency: variant?.price.currencyCode ?? 'GEL',
    trek,
    trekLabel: labelFromFilter(trek, TREK_FILTERS, locale),
    duration,
    durationLabel: labelFromFilter(duration, DURATION_FILTERS, locale),
    difficulty,
    difficultyLabel: labelFromFilter(difficulty, DIFFICULTY_FILTERS, locale),
    productHandle: product.handle,
    items: items.length ? items : [summary],
    productId: product.id,
    variantId: variant?.id,
    imageUrl: product.featuredImage?.url ?? collectionImageUrl,
    imageAlt:
      product.featuredImage?.altText ??
      product.includedCollection?.reference?.image?.altText ??
      product.title,
    imageUrls: collectPackageCardImages(
      product,
      includedCollectionProducts,
      collectionImageUrl,
    ),
    compareAtPrice: compareAt,
    savingsPercent,
    includedProductHandles,
    includedCollectionHandle: resolvedCollectionHandle,
    includedCollectionProducts,
    defaultDuration: duration,
  };
}

function mapGearProduct(
  product: CatalogProductNode,
  locale: 'ka' | 'en',
): ShopifyGearItem {
  const category = inferGearCategory(product);
  const variant = catalogRentVariant(product);
  const dailyRate = Number(variant?.price.amount ?? product.priceRange.minVariantPrice.amount);
  const variantCompareAt = Number(
    variant?.compareAtPrice?.amount ??
      product.compareAtPriceRange?.minVariantPrice.amount ??
      0,
  );
  const compareAt =
    variantCompareAt > 0 && variantCompareAt > dailyRate
      ? variantCompareAt
      : undefined;
  const savingsPercent =
    compareAt != null && compareAt > dailyRate
      ? Math.round(((compareAt - dailyRate) / compareAt) * 100)
      : undefined;
  const builderProduct = mapGearBuilderProduct(product);

  return {
    id: product.id,
    title: product.title,
    subtitle: product.description,
    priceLabel: `${formatGel(dailyRate)} / ${locale === 'ka' ? 'დღე' : 'day'}`,
    dailyRate,
    currency: variant?.price.currencyCode ?? 'GEL',
    category,
    categoryLabel: labelFromFilter(category, GEAR_FILTERS, locale),
    productHandle: product.handle,
    productId: product.id,
    variantId: variant?.id,
    imageUrl: product.featuredImage?.url,
    imageAlt: product.featuredImage?.altText ?? product.title,
    imageUrls: collectProductMediaImageUrls(product),
    compareAtPrice: compareAt,
    savingsPercent,
    builderProduct,
  };
}

function collectPackageCollectionCardImages(
  collection: PackageCollectionNode,
  kitProducts: GearBuilderProduct[],
): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  const add = (url?: string | null) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    urls.push(url);
  };

  add(collection.image?.url);
  for (const kit of kitProducts) {
    add(kit.imageUrl);
  }

  return urls;
}

function formatPackageCollectionTitle(title: string): string {
  return title.replace(/\s*kit contents\s*$/i, '').trim();
}

function inferTrekFromCollection(collection: PackageCollectionNode): string {
  const metafield = collection.trekMeta?.value?.trim();
  if (metafield) return metafield;

  const haystack = `${collection.handle} ${collection.title}`.toLowerCase();
  if (haystack.includes('birtvisi') || haystack.includes('ბირთვის')) {
    return 'birtvisi';
  }
  if (haystack.includes('tobavarchkhili') || haystack.includes('ტობავარჩ')) {
    return 'tobavarchkhili';
  }
  if (haystack.includes('borjomi') || haystack.includes('ბორჯომ')) {
    return 'borjomi';
  }
  if (haystack.includes('kazbegi') || haystack.includes('კაზბ')) {
    return 'kazbegi';
  }

  return 'tobavarchkhili';
}

function inferDurationFromCollection(
  collection: PackageCollectionNode,
): PackageDuration {
  const metafield = collection.durationMeta?.value?.trim();
  if (metafield) {
    return (metafield.replace(/^duration-/, '') ?? '2-day') as PackageDuration;
  }
  return '2-day';
}

function inferDifficultyFromCollection(collection: PackageCollectionNode): string {
  const metafield = collection.difficultyMeta?.value?.trim();
  if (metafield) return metafield.replace(/^difficulty-/, '');
  return 'moderate';
}

/** Storefront cannot read theme templateSuffix — mirror it with metafield or naming convention. */
export function isPackageKitCollection(collection: PackageCollectionNode): boolean {
  if (PACKAGE_LISTING_HANDLES.has(collection.handle)) return false;
  if (collection.handle === SHOPIFY_COLLECTION_HANDLES.gear) return false;

  const themeTemplate = collection.themeTemplate?.value?.trim().toLowerCase();
  if (themeTemplate === 'packages') return true;

  const isPackage = collection.isPackage?.value?.trim().toLowerCase();
  if (isPackage === 'true' || isPackage === '1') return true;

  const titleLower = collection.title.toLowerCase();
  const handleLower = collection.handle.toLowerCase();
  if (titleLower.includes('kit contents') || handleLower.endsWith('-includes')) {
    return true;
  }
  if (collection.handle.includes('კომპლექტ')) return true;

  return false;
}

function mapPackageCollection(
  collection: PackageCollectionNode,
  locale: 'ka' | 'en',
): ShopifyPackageItem | null {
  const kitNodes = collection.products?.nodes ?? [];
  if (!kitNodes.length) return null;

  const kitProducts = kitNodes.map((node) => mapGearBuilderProduct(node));
  const trek = inferTrekFromCollection(collection);
  const duration = inferDurationFromCollection(collection);
  const difficulty = inferDifficultyFromCollection(collection);
  const title = formatPackageCollectionTitle(collection.title);
  const summary = collection.description?.trim() ?? '';

  const packagePricing = calculatePackagePricing(
    packageRentDailyRatesFromProducts(kitProducts),
    DURATION_DAYS[duration],
  );

  const productHandle =
    packageProductHandleFromKitCollection(collection.handle) ?? collection.handle;

  return {
    id: collection.id,
    title,
    description: summary,
    priceLabel: `${formatGel(packagePricing.bundleDaily)} / ${locale === 'ka' ? 'დღე' : 'day'}`,
    dailyRate: packagePricing.bundleDaily,
    currency: 'GEL',
    trek,
    trekLabel: labelFromFilter(trek, TREK_FILTERS, locale),
    duration,
    durationLabel: labelFromFilter(duration, DURATION_FILTERS, locale),
    difficulty,
    difficultyLabel: labelFromFilter(difficulty, DIFFICULTY_FILTERS, locale),
    productHandle,
    items: kitProducts.map((entry) => entry.title),
    productId: collection.id,
    variantId: undefined,
    imageUrl: collection.image?.url,
    imageAlt: collection.image?.altText ?? title,
    imageUrls: collectPackageCollectionCardImages(collection, kitProducts),
    compareAtPrice: packagePricing.subtotalDaily,
    savingsPercent: packagePricing.discountPercent || undefined,
    includedProductHandles: kitProducts.map((entry) => entry.handle),
    includedCollectionHandle: collection.handle,
    includedCollectionProducts: kitProducts,
    defaultDuration: duration,
  };
}

export async function loadPackageCollections(
  storefront: Storefront,
): Promise<PackageCollectionNode[]> {
  const {collections} = await storefront
    .query(PACKAGE_COLLECTIONS_QUERY, {
      variables: {first: 50},
      ...liveStorefrontCache(storefront),
    })
    .catch(() => ({collections: null}));

  const nodes = (collections?.nodes ?? []) as PackageCollectionNode[];
  return nodes.filter(isPackageKitCollection);
}

export async function loadHomepageFeaturedSections(
  storefront: Storefront,
  locale: 'ka' | 'en',
  options?: {packageLimit?: number; gearLimit?: number},
): Promise<{packages: HomepageFeaturedItem[]; gear: HomepageFeaturedItem[]}> {
  const packageLimit = options?.packageLimit ?? 4;
  const gearLimit = options?.gearLimit ?? 4;
  const [packages, gear] = await Promise.all([
    loadShopifyPackages(storefront, locale).catch(() => [] as ShopifyPackageItem[]),
    loadShopifyGear(storefront, locale).catch(() => [] as ShopifyGearItem[]),
  ]);

  return {
    packages: packages.slice(0, packageLimit).map((pkg) => ({
      id: pkg.id,
      title: pkg.title,
      imageUrl: pkg.imageUrl,
      imageAlt: pkg.imageAlt,
      imageUrls: pkg.imageUrls,
      dailyRate: pkg.dailyRate,
      compareAt: pkg.compareAtPrice,
      url: resolvePackageItemUrl(pkg) ?? '/packages',
    })),
    gear: gear.slice(0, gearLimit).map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      imageAlt: item.imageAlt,
      imageUrls: item.imageUrls,
      dailyRate: item.dailyRate,
      compareAt: item.compareAtPrice,
      url: item.productHandle
        ? `/products/${item.productHandle}`
        : '/individual-gear',
    })),
  };
}

export async function loadShopifyPackages(
  storefront: Storefront,
  locale: 'ka' | 'en',
): Promise<ShopifyPackageItem[]> {
  const packageCollections = await loadPackageCollections(storefront);
  const fromCollections = packageCollections
    .map((collection) => mapPackageCollection(collection, locale))
    .filter((item): item is ShopifyPackageItem => item != null);

  if (fromCollections.length > 0) return fromCollections;

  const {collection} = await storefront.query(COLLECTION_PRODUCTS_QUERY, {
    variables: {
      handle: SHOPIFY_COLLECTION_HANDLES.packages,
      first: 50,
    },
    ...liveStorefrontCache(storefront),
  });

  if (!collection?.products?.nodes?.length) return [];

  const nodes = collection.products.nodes as CatalogProductNode[];

  return Promise.all(
    nodes.map(async (product) => {
      const kit = await resolvePackageKitProducts(storefront, product);

      return mapPackageProduct(
        product,
        locale,
        kit.products,
        kit.handle,
        kit.collectionImageUrl,
      );
    }),
  );
}

export async function loadShopifyGear(
  storefront: Storefront,
  locale: 'ka' | 'en',
): Promise<ShopifyGearItem[]> {
  const {collection} = await storefront.query(COLLECTION_PRODUCTS_QUERY, {
    variables: {
      handle: SHOPIFY_COLLECTION_HANDLES.gear,
      first: 50,
    },
    ...liveStorefrontCache(storefront),
  });

  if (!collection?.products?.nodes?.length) return [];

  return (collection.products.nodes as CatalogProductNode[]).map((product) =>
    mapGearProduct(product, locale),
  );
}

export async function loadGearBuilderCatalog(
  storefront: Storefront,
): Promise<GearBuilderProduct[]> {
  const gear = await loadShopifyGear(storefront, 'en');
  return gear.map((item) => item.builderProduct);
}

export {CATALOG_PRODUCT_FRAGMENT, COLLECTION_PRODUCTS_QUERY, PACKAGE_COLLECTIONS_QUERY};
