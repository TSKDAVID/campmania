import {
  filterRentVariants,
  pickRentVariant,
  type FulfillmentVariantNode,
} from '~/lib/trailrent/product-variants';
import type {GearBuilderProduct} from './types';

function toFulfillmentNodes(
  product: GearBuilderProduct,
): FulfillmentVariantNode[] {
  return product.variants.map((variant) => ({
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    price: {amount: String(variant.price), currencyCode: 'GEL'},
  }));
}

/** Rent variants for gear builder UI (never includes explicit Buy variants). */
export function builderRentVariants(
  product: GearBuilderProduct,
): FulfillmentVariantNode[] {
  const nodes = toFulfillmentNodes(product);
  const rentOnly = filterRentVariants(nodes);
  return rentOnly.length ? rentOnly : nodes;
}

/** Pick the rental variant to store in a builder slot. */
export function resolveBuilderRentVariant(
  product: GearBuilderProduct,
  variantId?: string,
): FulfillmentVariantNode | undefined {
  const rentPool = builderRentVariants(product);
  const nodes = toFulfillmentNodes(product);

  if (variantId) {
    const fromRent = rentPool.find((variant) => variant.id === variantId);
    if (fromRent) return fromRent;
  }

  const picked = pickRentVariant(rentPool.length ? rentPool : nodes);
  if (picked) return picked;

  if (product.variantId) {
    return (
      nodes.find((variant) => variant.id === product.variantId) ?? {
        id: product.variantId,
        title: product.title,
        availableForSale: product.availableForSale,
        price: {amount: String(product.dailyRate), currencyCode: 'GEL'},
      }
    );
  }

  return undefined;
}

export function builderRentVariantPrice(
  product: GearBuilderProduct,
  variant?: FulfillmentVariantNode,
): number {
  if (variant) return Number(variant.price.amount);
  return product.dailyRate;
}
