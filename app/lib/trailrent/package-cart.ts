import type {OptimisticCartLineInput} from '@shopify/hydrogen';
import type {GearBuilderProduct} from '~/lib/trailrent/gear-builder';
import {resolveBuilderRentVariant} from '~/lib/trailrent/gear-builder/variants';
import {buildRentalLineAttributes} from '~/components/RentalProductForm';
import {DEPOSIT_AMOUNT_ATTR} from '~/lib/trailrent/deposit';

export const TRAIL_PACKAGE_TITLE_ATTR = 'trail_package_title';
export const TRAIL_PACKAGE_COLLECTION_ATTR = 'trail_package_collection';

const QUOTED_PRICE_ATTR_KEYS = new Set([
  'quoted_daily_rate',
  'quoted_compare_at_daily',
]);

function stripSharedQuotedPriceAttributes(
  attributes: Array<{key: string; value: string}>,
) {
  return attributes.filter((attr) => !QUOTED_PRICE_ATTR_KEYS.has(attr.key));
}

/** Split bundle daily rate across kit lines so cart totals match the package price. */
export function allocatePackageItemDailyRates(
  products: GearBuilderProduct[],
  packageDailyRate: number,
): number[] {
  const rates = products.map((product) => Math.max(0, product.dailyRate));
  const sum = rates.reduce((total, rate) => total + rate, 0);
  if (sum <= 0 || packageDailyRate <= 0) {
    return rates.map(() => 0);
  }

  let allocated = 0;
  return rates.map((rate, index) => {
    if (index === rates.length - 1) {
      return Math.max(0, packageDailyRate - allocated);
    }
    const share = Math.round((rate / sum) * packageDailyRate);
    allocated += share;
    return share;
  });
}

function itemQuotedPriceAttributes(
  product: GearBuilderProduct,
  quotedDaily: number,
): Array<{key: string; value: string}> {
  const compareAt = Math.round(product.dailyRate);
  const attrs: Array<{key: string; value: string}> = [];

  if (quotedDaily > 0) {
    attrs.push({key: 'quoted_daily_rate', value: String(quotedDaily)});
  }
  if (compareAt > quotedDaily) {
    attrs.push({key: 'quoted_compare_at_daily', value: String(compareAt)});
  }

  return attrs;
}

/** Cart lines for a trail package collection when no single package SKU exists. */
export function buildTrailPackageKitCartLines(options: {
  kitProducts: GearBuilderProduct[];
  collectionHandle: string;
  packageTitle: string;
  discountPercent: number;
  rentalDays: number;
  packageDailyRate?: number;
  lineAttributes: Array<{key: string; value: string}>;
}): OptimisticCartLineInput[] {
  const {
    kitProducts,
    collectionHandle,
    packageTitle,
    discountPercent,
    rentalDays,
    packageDailyRate,
    lineAttributes,
  } = options;

  const sharedAttributes = stripSharedQuotedPriceAttributes(lineAttributes);
  const itemDailyRates =
    packageDailyRate != null && packageDailyRate > 0
      ? allocatePackageItemDailyRates(kitProducts, packageDailyRate)
      : kitProducts.map((product) => {
          const daily = Math.max(0, product.dailyRate);
          return discountPercent > 0
            ? Math.round(daily * (1 - discountPercent / 100))
            : Math.round(daily);
        });

  const lines: OptimisticCartLineInput[] = [];

  kitProducts.forEach((product, index) => {
    const variant = resolveBuilderRentVariant(product);
    if (!variant?.id) return;

    lines.push({
      merchandiseId: variant.id,
      quantity: rentalDays,
      attributes: [
        ...sharedAttributes,
        ...itemQuotedPriceAttributes(product, itemDailyRates[index] ?? 0),
        {key: TRAIL_PACKAGE_COLLECTION_ATTR, value: collectionHandle},
        {key: TRAIL_PACKAGE_TITLE_ATTR, value: packageTitle},
        ...(product.depositAmount != null && product.depositAmount > 0
          ? [{key: DEPOSIT_AMOUNT_ATTR, value: String(product.depositAmount)}]
          : []),
        ...(discountPercent > 0
          ? [{key: 'trail_package_discount_percent', value: String(discountPercent)}]
          : []),
      ],
    });
  });

  return lines;
}
