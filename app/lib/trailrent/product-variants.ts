/** Resolve Rent vs Buy Shopify variants for Campmania fulfillment modes. */

export type FulfillmentVariantNode = {
  id: string;
  title?: string | null;
  availableForSale?: boolean;
  price: {amount: string; currencyCode: string};
  compareAtPrice?: {amount: string; currencyCode: string} | null;
  selectedOptions?: Array<{name: string; value: string}>;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

const RENT_PATTERN = /\b(rent|rental|ქირა)\b/i;
const BUY_PATTERN = /\b(buy|purchase|ყიდვა)\b/i;

function variantLabel(variant: FulfillmentVariantNode): string {
  const optionText =
    variant.selectedOptions?.map((option) => option.value).join(' ') ?? '';
  return `${variant.title ?? ''} ${optionText}`.trim();
}

function isRentVariant(variant: FulfillmentVariantNode): boolean {
  return RENT_PATTERN.test(variantLabel(variant));
}

function isBuyVariant(variant: FulfillmentVariantNode): boolean {
  return BUY_PATTERN.test(variantLabel(variant));
}

function byPriceAsc(
  a: FulfillmentVariantNode,
  b: FulfillmentVariantNode,
): number {
  return Number(a.price.amount) - Number(b.price.amount);
}

function byPriceDesc(
  a: FulfillmentVariantNode,
  b: FulfillmentVariantNode,
): number {
  return Number(b.price.amount) - Number(a.price.amount);
}

export function parseAvailableForPurchase(
  value?: string | null,
): boolean | undefined {
  if (value == null || value.trim() === '') return undefined;
  const normalized = value.trim().toLowerCase();
  if (
    normalized === 'true' ||
    normalized === '1' ||
    normalized === 'yes' ||
    normalized === 'on'
  ) {
    return true;
  }
  if (
    normalized === 'false' ||
    normalized === '0' ||
    normalized === 'no' ||
    normalized === 'off'
  ) {
    return false;
  }
  return undefined;
}

/** Parse Shopify money metafield (JSON or plain number). */
export function parsePurchasePriceMetafield(
  value?: string | null,
): number | undefined {
  if (value == null || value.trim() === '') return undefined;

  const trimmed = value.trim();
  try {
    const parsed = JSON.parse(trimmed) as {
      amount?: string | number;
      currency_code?: string;
    };
    if (parsed.amount != null) {
      const amount = Number(parsed.amount);
      return Number.isFinite(amount) && amount > 0 ? amount : undefined;
    }
  } catch {
    // plain number string
  }

  const amount = Number(trimmed.replace(/[^\d.]/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

export function coalesceMetafieldValue(
  ...values: Array<string | null | undefined>
): string | null | undefined {
  for (const value of values) {
    if (value != null && value.trim() !== '') return value;
  }
  return undefined;
}

export function pickRentVariant(
  variants: FulfillmentVariantNode[],
): FulfillmentVariantNode | undefined {
  if (!variants.length) return undefined;

  const explicit = variants.find(isRentVariant);
  if (explicit) return explicit;

  if (variants.length === 1) return variants[0];

  const buy = variants.find(isBuyVariant);
  const nonBuy = buy
    ? variants.filter((variant) => variant.id !== buy.id)
    : variants;

  if (nonBuy.length) {
    return [...nonBuy].sort(byPriceAsc)[0];
  }

  return [...variants].sort(byPriceAsc)[0];
}

export function pickBuyVariant(
  variants: FulfillmentVariantNode[],
  rentVariant?: FulfillmentVariantNode,
): FulfillmentVariantNode | undefined {
  if (!variants.length) return undefined;

  const explicit = variants.find(isBuyVariant);
  if (explicit) return explicit;

  if (variants.length < 2) return undefined;

  const candidates = rentVariant
    ? variants.filter((variant) => variant.id !== rentVariant.id)
    : variants;

  if (!candidates.length) return undefined;

  return [...candidates].sort(byPriceDesc)[0];
}

export type ResolvedFulfillmentVariants = {
  rentVariant: FulfillmentVariantNode;
  buyVariant?: FulfillmentVariantNode;
  buyAvailable: boolean;
  /** Purchase price from Buy variant or purchase-price metafield. */
  purchasePrice: number;
  /** True when checkout can charge the buy price via a dedicated Buy variant. */
  buyCheckoutReady: boolean;
};

export function resolveFulfillmentVariants(options: {
  variants: FulfillmentVariantNode[];
  availableForPurchaseMeta?: string | null;
  purchasePriceMeta?: string | null;
}): ResolvedFulfillmentVariants | null {
  const rentVariant = pickRentVariant(options.variants);
  if (!rentVariant) return null;

  const buyVariant = pickBuyVariant(options.variants, rentVariant);
  const metaFlag = parseAvailableForPurchase(options.availableForPurchaseMeta);
  const purchasePriceFromMeta = parsePurchasePriceMetafield(
    options.purchasePriceMeta,
  );
  const hasDistinctBuy =
    Boolean(buyVariant) && buyVariant!.id !== rentVariant.id;
  const buyInStock = buyVariant?.availableForSale !== false;
  const purchasePriceFromVariant = hasDistinctBuy
    ? Number(buyVariant!.price.amount)
    : 0;

  const purchasePrice =
    purchasePriceFromVariant > 0
      ? purchasePriceFromVariant
      : (purchasePriceFromMeta ?? 0);

  let buyAvailable = false;
  if (metaFlag === false) {
    buyAvailable = false;
  } else if (metaFlag === true) {
    buyAvailable =
      (hasDistinctBuy && buyInStock) ||
      (purchasePriceFromMeta != null && purchasePriceFromMeta > 0);
  } else {
    buyAvailable = hasDistinctBuy && buyInStock;
  }

  return {
    rentVariant,
    buyVariant: hasDistinctBuy ? buyVariant : undefined,
    buyAvailable,
    purchasePrice,
    buyCheckoutReady: hasDistinctBuy && buyInStock,
  };
}

export function collectProductVariants(product: {
  variants?: {nodes: FulfillmentVariantNode[]} | null;
  selectedOrFirstAvailableVariant?: FulfillmentVariantNode | null;
  adjacentVariants?: FulfillmentVariantNode[] | null;
}): FulfillmentVariantNode[] {
  const fromList = product.variants?.nodes ?? [];
  if (fromList.length) return fromList;

  const merged = [
    product.selectedOrFirstAvailableVariant,
    ...(product.adjacentVariants ?? []),
  ].filter((variant): variant is FulfillmentVariantNode => Boolean(variant));

  const unique = new Map<string, FulfillmentVariantNode>();
  for (const variant of merged) {
    unique.set(variant.id, variant);
  }

  return [...unique.values()];
}
