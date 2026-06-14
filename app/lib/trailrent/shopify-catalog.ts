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
import {
  pickRentVariant,
  collectProductVariants,
  type FulfillmentVariantNode,
} from '~/lib/trailrent/product-variants';

/** Create these collections in Shopify Admin and add products. */
export const SHOPIFY_COLLECTION_HANDLES = {
  packages: 'trail-packages',
  gear: 'individual-gear',
} as const;

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
  kitSummary?: {value: string} | null;
};

export type ShopifyPackageItem = PackageItem & {
  productId: string;
  variantId?: string;
  imageUrl?: string;
  imageAlt?: string;
  compareAtPrice?: number;
  savingsPercent?: number;
};

export type ShopifyGearItem = GearItem & {
  productId: string;
  variantId?: string;
  imageUrl?: string;
  imageAlt?: string;
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

function catalogRentVariant(product: CatalogProductNode) {
  const variants = collectProductVariants({
    variants: product.variants,
    selectedOrFirstAvailableVariant: product.selectedOrFirstAvailableVariant,
  });
  return pickRentVariant(variants) ?? product.selectedOrFirstAvailableVariant;
}

function mapPackageProduct(
  product: CatalogProductNode,
  locale: 'ka' | 'en',
): ShopifyPackageItem {
  const trek = tagValue(product.tags, 'trek') ?? 'tobavarchkhili';
  const duration = tagValue(product.tags, 'duration') ?? '2-day';
  const difficulty = tagValue(product.tags, 'difficulty') ?? 'moderate';

  const variant = catalogRentVariant(product);
  const dailyRate = Number(variant?.price.amount ?? product.priceRange.minVariantPrice.amount);
  const compareAt = Number(
    variant?.compareAtPrice?.amount ??
      product.compareAtPriceRange?.minVariantPrice.amount ??
      0,
  );

  const items = parseIncludedItems(product.includedItems);
  const summary = product.kitSummary?.value ?? product.description;

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
  };
}

function mapGearProduct(
  product: CatalogProductNode,
  locale: 'ka' | 'en',
): ShopifyGearItem {
  const category = tagValue(product.tags, 'gear') ?? 'tent';
  const variant = catalogRentVariant(product);
  const dailyRate = Number(variant?.price.amount ?? product.priceRange.minVariantPrice.amount);

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
  });

  if (!collection?.products?.nodes?.length) return [];

  return (collection.products.nodes as CatalogProductNode[]).map((product) =>
    mapPackageProduct(product, locale),
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
  });

  if (!collection?.products?.nodes?.length) return [];

  return (collection.products.nodes as CatalogProductNode[]).map((product) =>
    mapGearProduct(product, locale),
  );
}

export {CATALOG_PRODUCT_FRAGMENT, COLLECTION_PRODUCTS_QUERY};
