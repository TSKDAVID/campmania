import type {OptimisticCartLineInput} from '@shopify/hydrogen';
import type {GearBuilderProduct} from '~/lib/trailrent/gear-builder';
import {resolveBuilderRentVariant} from '~/lib/trailrent/gear-builder/variants';
import {buildRentalLineAttributes} from '~/components/RentalProductForm';
export const TRAIL_PACKAGE_TITLE_ATTR = 'trail_package_title';

/** Cart lines for a trail package collection when no single package SKU exists. */
export function buildTrailPackageKitCartLines(options: {
  kitProducts: GearBuilderProduct[];
  collectionHandle: string;
  packageTitle: string;
  discountPercent: number;
  rentalDays: number;
  lineAttributes: Array<{key: string; value: string}>;
}): OptimisticCartLineInput[] {
  const {
    kitProducts,
    collectionHandle,
    packageTitle,
    discountPercent,
    rentalDays,
    lineAttributes,
  } = options;

  const lines: OptimisticCartLineInput[] = [];

  for (const product of kitProducts) {
    const variant = resolveBuilderRentVariant(product);
    if (!variant?.id) continue;

    lines.push({
      merchandiseId: variant.id,
      quantity: rentalDays,
      attributes: [
        ...lineAttributes,
        {key: TRAIL_PACKAGE_COLLECTION_ATTR, value: collectionHandle},
        {key: TRAIL_PACKAGE_TITLE_ATTR, value: packageTitle},
        ...(discountPercent > 0
          ? [{key: 'trail_package_discount_percent', value: String(discountPercent)}]
          : []),
      ],
    });
  }

  return lines;
}

export const TRAIL_PACKAGE_COLLECTION_ATTR = 'trail_package_collection';
