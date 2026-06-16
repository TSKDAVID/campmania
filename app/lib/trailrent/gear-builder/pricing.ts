import {formatGel} from '~/lib/trailrent/pricing';
import {PACKAGE_BUNDLE_DISCOUNT} from './types';

export function applyBundleDiscount(subtotalDaily: number): number {
  return subtotalDaily * (1 - PACKAGE_BUNDLE_DISCOUNT);
}

export function calculateBundlePricing(subtotalDaily: number, days: number) {
  const bundleDaily = applyBundleDiscount(subtotalDaily);
  return {
    subtotalDaily,
    bundleDaily,
    bundleTotal: bundleDaily * days,
    discountPercent: Math.round(PACKAGE_BUNDLE_DISCOUNT * 100),
    bundleDailyLabel: formatGel(bundleDaily),
    bundleTotalLabel: formatGel(bundleDaily * days),
  };
}
