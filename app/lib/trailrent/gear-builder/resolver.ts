import type {
  GearBuilderProduct,
  GearItemType,
  PackageDuration,
  ResolvedPackage,
  ResolvedPackageItem,
} from './types';
import {calculatePackagePricing} from './pricing';

export const DURATION_DAYS: Record<PackageDuration, number> = {
  '1-day': 1,
  '2-day': 2,
  weekend: 3,
};

const DURATION_ALIASES: Record<string, PackageDuration> = {
  '3-day': 'weekend',
  '3days': 'weekend',
};

export function normalizePackageDuration(
  value: PackageDuration | string,
): PackageDuration {
  const normalized = String(value).trim().toLowerCase();
  if (normalized in DURATION_DAYS) {
    return normalized as PackageDuration;
  }
  return DURATION_ALIASES[normalized] ?? '2-day';
}

export function packageDurationDays(duration: PackageDuration | string): number {
  return DURATION_DAYS[normalizePackageDuration(duration)];
}

/** Industry-style backpack capacity targets by hike length (liters). */
export const BACKPACK_CAPACITY_BY_DURATION: Record<
  PackageDuration,
  {min: number; ideal: number; max: number}
> = {
  '1-day': {min: 20, ideal: 25, max: 35},
  '2-day': {min: 30, ideal: 40, max: 50},
  weekend: {min: 45, ideal: 55, max: 65},
};

export const REQUIRED_TYPES_BY_DURATION: Record<PackageDuration, GearItemType[]> = {
  '1-day': ['backpack'],
  '2-day': ['backpack', 'lighting'],
  weekend: ['backpack', 'lighting', 'kitchen'],
};

function scoreBackpack(
  product: GearBuilderProduct,
  duration: PackageDuration,
): number {
  const target = BACKPACK_CAPACITY_BY_DURATION[duration];
  const liters =
    product.metafields.capacityLiters ??
    product.variants.find((v) => v.availableForSale)?.capacityLiters ??
    product.variants[0]?.capacityLiters;

  if (!liters) return product.metafields.thumbnailPriority;

  let score = 100 - Math.abs(liters - target.ideal);
  if (liters < target.min) score -= 40;
  if (liters > target.max) score -= 20;
  if (!product.availableForSale) score -= 200;
  return score + product.metafields.thumbnailPriority;
}

function pickBestForType(
  products: GearBuilderProduct[],
  itemType: GearItemType,
  duration: PackageDuration,
): GearBuilderProduct | undefined {
  const candidates = products.filter(
    (product) =>
      product.metafields.builderEnabled &&
      product.metafields.itemType === itemType &&
      product.metafields.durationFit.includes(duration) &&
      product.availableForSale,
  );

  if (!candidates.length) return undefined;

  if (itemType === 'backpack') {
    return [...candidates].sort(
      (a, b) => scoreBackpack(b, duration) - scoreBackpack(a, duration),
    )[0];
  }

  return [...candidates].sort(
    (a, b) => b.metafields.thumbnailPriority - a.metafields.thumbnailPriority,
  )[0];
}

function toResolvedItem(product: GearBuilderProduct): ResolvedPackageItem {
  const variant =
    product.variants.find((entry) => entry.availableForSale) ?? product.variants[0];
  return {
    productId: product.id,
    handle: product.handle,
    title: product.title,
    imageUrl: product.imageUrl,
    variantId: variant?.id ?? product.variantId,
    dailyRate: variant?.price ?? product.dailyRate,
    itemType: product.metafields.itemType,
  };
}

function normalizeLabel(input: string): string {
  return input.trim().toLowerCase();
}

function matchGearByLabel(
  label: string,
  gearCatalog: GearBuilderProduct[],
): GearBuilderProduct | undefined {
  const value = normalizeLabel(label);
  return gearCatalog.find((product) => {
    const title = normalizeLabel(product.title);
    const handle = normalizeLabel(product.handle);
    return (
      value.includes(title) ||
      title.includes(value) ||
      value.includes(handle) ||
      handle.includes(value.replace(/\s+/g, '-'))
    );
  });
}

export function resolvePackageComposition(options: {
  trek: string;
  duration: PackageDuration;
  baseProductIds?: string[];
  baseProductHandles?: string[];
  fallbackItemLabels?: string[];
  gearCatalog: GearBuilderProduct[];
}): ResolvedPackage {
  const {
    trek,
    duration,
    baseProductIds = [],
    baseProductHandles = [],
    fallbackItemLabels = [],
    gearCatalog,
  } = options;
  const days = packageDurationDays(duration);

  const seenProductIds = new Set<string>();
  const baseProducts: GearBuilderProduct[] = [];

  for (const handle of baseProductHandles) {
    const product = gearCatalog.find(
      (entry) => entry.handle === handle || entry.handle === handle.trim(),
    );
    if (product && !seenProductIds.has(product.id)) {
      seenProductIds.add(product.id);
      baseProducts.push(product);
    }
  }

  for (const id of baseProductIds) {
    const product = gearCatalog.find((entry) => entry.id === id);
    if (product && !seenProductIds.has(product.id)) {
      seenProductIds.add(product.id);
      baseProducts.push(product);
    }
  }

  for (const label of fallbackItemLabels) {
    const product = matchGearByLabel(label, gearCatalog);
    if (product && !seenProductIds.has(product.id)) {
      seenProductIds.add(product.id);
      baseProducts.push(product);
    }
  }

  const baseItems = baseProducts.map(toResolvedItem);

  const existingTypes = new Set(baseItems.map((item) => item.itemType));
  const requiredTypes = REQUIRED_TYPES_BY_DURATION[duration];

  for (const itemType of requiredTypes) {
    if (existingTypes.has(itemType)) continue;
    const picked = pickBestForType(gearCatalog, itemType, duration);
    if (picked) {
      baseItems.push(toResolvedItem(picked));
      existingTypes.add(itemType);
    }
  }

  const rentDailyRates = baseItems.map((item) => item.dailyRate);
  const pricing = calculatePackagePricing(rentDailyRates, days);

  return {
    trek,
    duration,
    days,
    items: baseItems,
    subtotalDaily: pricing.subtotalDaily,
    bundleDaily: pricing.bundleDaily,
    bundleTotal: pricing.bundleTotal,
    discountPercent: pricing.discountPercent,
  };
}

export function groupGearByType(
  gearCatalog: GearBuilderProduct[],
): Record<GearItemType, GearBuilderProduct[]> {
  const grouped = {} as Record<GearItemType, GearBuilderProduct[]>;
  for (const product of gearCatalog) {
    if (!product.metafields.builderEnabled) continue;
    const type = product.metafields.itemType;
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(product);
  }
  for (const type of Object.keys(grouped) as GearItemType[]) {
    grouped[type].sort(
      (a, b) => b.metafields.thumbnailPriority - a.metafields.thumbnailPriority,
    );
  }
  return grouped;
}
