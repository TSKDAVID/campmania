import type {GearBuilderProduct, GearBuilderSlot} from './types';
import {
  builderRentVariantPrice,
  resolveBuilderRentVariant,
} from './variants';

function findProduct(
  products: GearBuilderProduct[],
  slot: GearBuilderSlot,
): GearBuilderProduct | undefined {
  if (slot.productId) {
    const byId = products.find((product) => product.id === slot.productId);
    if (byId) return byId;
  }
  if (slot.handle) {
    return products.find((product) => product.handle === slot.handle);
  }
  return undefined;
}

/** Restore image URLs and catalog fields stripped from session storage. */
export function enrichGearBuilderSlots(
  slots: GearBuilderSlot[],
  products: GearBuilderProduct[],
): GearBuilderSlot[] {
  if (!products.length) return slots;

  return slots.map((slot) => {
    if (!slot.productId && !slot.handle) return slot;

    const product = findProduct(products, slot);
    if (!product) return slot;

    const variant = resolveBuilderRentVariant(product, slot.variantId);
    const dailyRate = slot.dailyRate ?? builderRentVariantPrice(product, variant);

    return {
      ...slot,
      productId: slot.productId ?? product.id,
      variantId: slot.variantId ?? variant?.id,
      handle: slot.handle ?? product.handle,
      title: slot.title ?? product.title,
      imageUrl: slot.imageUrl ?? product.imageUrl,
      dailyRate,
    };
  });
}

export function slotsNeedCatalogEnrichment(slots: GearBuilderSlot[]): boolean {
  return slots.some(
    (slot) => (slot.productId || slot.handle) && !slot.imageUrl,
  );
}
