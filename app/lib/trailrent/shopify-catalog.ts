import {
  COLLECTION_PRODUCTS_QUERY,
  CATALOG_PRODUCT_FRAGMENT,
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
import {formatGel} from '~/lib/trailrent/pricing';
import {liveStorefrontCache} from '~/lib/trailrent/storefront-live';
import {
  parseGearBuilderMetafields,
  capacityFromVariantTitle,
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
  packages: 'trail-packages',
  gear: 'individual-gear',
} as const;

/** Handle for the Shopify collection that lists this package's included gear. */
export function packageIncludesCollectionHandle(packageHandle: string): string {
  return `${packageHandle}-includes`;
}

type CatalogProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  featuredImage?: {
    url: string;
    altText?: string | null;
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
    reference?: {
      handle?: string;
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
  compareAtPrice?: number;
  savingsPercent?: number;
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
): Promise<GearBuilderProduct[]> {
  const {collection} = await storefront.query(COLLECTION_PRODUCTS_QUERY, {
    variables: {handle, first: 50},
    ...liveStorefrontCache(storefront),
  });

  const nodes = (collection?.products?.nodes ?? []) as CatalogProductNode[];
  return nodes.map((node) => mapGearBuilderProduct(node));
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

function mapPackageProduct(
  product: CatalogProductNode,
  locale: 'ka' | 'en',
  includedFromCollection?: GearBuilderProduct[],
  includedCollectionHandle?: string,
): ShopifyPackageItem {
  const trek = tagValue(product.tags, 'trek') ?? 'tobavarchkhili';
  const duration = (tagValue(product.tags, 'duration') ?? '2-day') as PackageDuration;
  const difficulty = tagValue(product.tags, 'difficulty') ?? 'moderate';

  const variant = catalogRentVariant(product);
  const dailyRate = Number(variant?.price.amount ?? product.priceRange.minVariantPrice.amount);
  const compareAt = Number(
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

  const savingsPercent =
    compareAt > dailyRate && compareAt > 0
      ? Math.round(((compareAt - dailyRate) / compareAt) * 100)
      : undefined;

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
    imageUrl: product.featuredImage?.url,
    imageAlt: product.featuredImage?.altText ?? product.title,
    compareAtPrice: compareAt > 0 ? compareAt : undefined,
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
    builderProduct,
  };
}

export async function loadShopifyPackages(
  storefront: Storefront,
  locale: 'ka' | 'en',
): Promise<ShopifyPackageItem[]> {
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
      const kitHandle =
        product.includedCollection?.reference?.handle ??
        packageIncludesCollectionHandle(product.handle);
      const includedCollectionProducts = await loadKitCollectionProducts(
        storefront,
        kitHandle,
      );

      return mapPackageProduct(
        product,
        locale,
        includedCollectionProducts,
        kitHandle,
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

export {CATALOG_PRODUCT_FRAGMENT, COLLECTION_PRODUCTS_QUERY};
