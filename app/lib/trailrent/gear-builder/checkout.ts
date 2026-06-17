import type {GearBuilderSlot} from './types';
import {PACKAGE_BUNDLE_DISCOUNT} from './types';
import {bundleQualifiesForDiscount} from './pricing';
import type {OptimisticCartLineInput} from '@shopify/hydrogen';

/** Cart line attributes used to identify gear-builder bundle items at checkout. */
export const GEAR_BUILDER_CART_ATTR = 'gear_builder';
export const GEAR_BUILDER_TYPE_ATTR = 'gear_builder_item_type';
export const GEAR_BUILDER_DISCOUNT_ATTR = 'gear_builder_discount_percent';

/**
 * Production note: enforce the bundle discount at checkout with a Shopify
 * Discount Function that reads `gear_builder` line attributes and applies
 * PACKAGE_BUNDLE_DISCOUNT to qualifying rental lines (2+ items).
 */
export function buildGearBuilderCartLines(
  slots: GearBuilderSlot[],
): OptimisticCartLineInput[] {
  const filledCount = slots.filter((slot) => slot.variantId).length;
  const discountPercent = bundleQualifiesForDiscount(filledCount)
    ? Math.round(PACKAGE_BUNDLE_DISCOUNT * 100)
    : 0;

  return slots
    .filter((slot) => slot.variantId)
    .map((slot) => ({
      merchandiseId: slot.variantId!,
      quantity: 1,
      attributes: [
        {key: 'fulfillment_mode', value: 'rent'},
        {key: GEAR_BUILDER_CART_ATTR, value: 'true'},
        {key: GEAR_BUILDER_TYPE_ATTR, value: slot.itemType},
        ...(discountPercent
          ? [{key: GEAR_BUILDER_DISCOUNT_ATTR, value: String(discountPercent)}]
          : []),
      ],
    }));
}
