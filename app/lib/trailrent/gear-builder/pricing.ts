import {formatGel} from '~/lib/trailrent/pricing';
import {GEAR_BUILDER_MIN_SAVE_ITEMS, PACKAGE_BUNDLE_DISCOUNT} from './types';

export function sumRentDailyRates(rentDailyRates: number[]): number {
  return rentDailyRates.reduce((sum, rate) => sum + rate, 0);
}

/** Undiscounted package compare-at: round(sum of included gear rent daily rates). */
export function roundPackageCompareAtDaily(rentDailyRates: number[]): number {
  return Math.round(sumRentDailyRates(rentDailyRates));
}

/** package_daily_price = round(sum(rent) * (1 - PACKAGE_BUNDLE_DISCOUNT)) */
export function calculatePackageDailyPrice(rentDailyRates: number[]): number {
  if (rentDailyRates.length === 0) return 0;
  return Math.round(
    sumRentDailyRates(rentDailyRates) * (1 - PACKAGE_BUNDLE_DISCOUNT),
  );
}

export function calculatePackagePricing(rentDailyRates: number[], days: number) {
  const rawSum = sumRentDailyRates(rentDailyRates);
  const subtotalDaily = Math.round(rawSum);
  const bundleDaily =
    rentDailyRates.length > 0
      ? Math.round(rawSum * (1 - PACKAGE_BUNDLE_DISCOUNT))
      : 0;
  const discountPercent =
    subtotalDaily > bundleDaily && subtotalDaily > 0
      ? Math.round(((subtotalDaily - bundleDaily) / subtotalDaily) * 100)
      : 0;

  return {
    subtotalDaily,
    bundleDaily,
    bundleTotal: bundleDaily * days,
    discountPercent,
    bundleDailyLabel: formatGel(bundleDaily),
    bundleTotalLabel: formatGel(bundleDaily * days),
    subtotalDailyLabel: formatGel(subtotalDaily),
  };
}

export function applyBundleDiscount(subtotalDaily: number): number {
  return Math.round(subtotalDaily * (1 - PACKAGE_BUNDLE_DISCOUNT));
}

export function bundleQualifiesForDiscount(filledItemCount: number): boolean {
  return filledItemCount >= GEAR_BUILDER_MIN_SAVE_ITEMS;
}

export function calculateBundlePricing(
  subtotalDaily: number,
  days: number,
  filledItemCount = GEAR_BUILDER_MIN_SAVE_ITEMS,
) {
  const roundedSubtotal = Math.round(subtotalDaily);
  const qualifies = bundleQualifiesForDiscount(filledItemCount);
  const bundleDaily = qualifies
    ? applyBundleDiscount(roundedSubtotal)
    : roundedSubtotal;
  const discountPercent =
    qualifies && roundedSubtotal > bundleDaily
      ? Math.round(((roundedSubtotal - bundleDaily) / roundedSubtotal) * 100)
      : 0;

  return {
    subtotalDaily: roundedSubtotal,
    bundleDaily,
    bundleTotal: bundleDaily * days,
    discountPercent,
    bundleDailyLabel: formatGel(bundleDaily),
    bundleTotalLabel: formatGel(bundleDaily * days),
    subtotalDailyLabel: formatGel(roundedSubtotal),
  };
}
