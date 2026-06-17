import {formatGel} from '~/lib/trailrent/pricing';
import {GEAR_BUILDER_MIN_SAVE_ITEMS, PACKAGE_BUNDLE_DISCOUNT} from './types';

export function applyBundleDiscount(subtotalDaily: number): number {
  return subtotalDaily * (1 - PACKAGE_BUNDLE_DISCOUNT);
}

export function bundleQualifiesForDiscount(filledItemCount: number): boolean {
  return filledItemCount >= GEAR_BUILDER_MIN_SAVE_ITEMS;
}

export function calculateBundlePricing(
  subtotalDaily: number,
  days: number,
  filledItemCount = GEAR_BUILDER_MIN_SAVE_ITEMS,
) {
  const qualifies = bundleQualifiesForDiscount(filledItemCount);
  const bundleDaily = qualifies
    ? applyBundleDiscount(subtotalDaily)
    : subtotalDaily;

  return {
    subtotalDaily,
    bundleDaily,
    bundleTotal: bundleDaily * days,
    discountPercent: qualifies ? Math.round(PACKAGE_BUNDLE_DISCOUNT * 100) : 0,
    bundleDailyLabel: formatGel(bundleDaily),
    bundleTotalLabel: formatGel(bundleDaily * days),
    subtotalDailyLabel: formatGel(subtotalDaily),
  };
}
