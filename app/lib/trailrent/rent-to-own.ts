import type {RentToOwnOffer} from '~/components/RentalProductForm';
import type {CustomerRentalHistoryQuery} from 'customer-accountapi.generated';

type RentalHistoryOrder =
  CustomerRentalHistoryQuery['customer']['orders']['nodes'][number];

type RentalHistoryLineItem =
  RentalHistoryOrder['lineItems']['nodes'][number];

/** Line item custom attributes that identify a prior rental (not a purchase). */
export function isRentalLineItem(lineItem: RentalHistoryLineItem): boolean {
  const attrs = Object.fromEntries(
    lineItem.customAttributes.map((a) => [a.key, a.value ?? '']),
  );
  return attrs.fulfillment_mode === 'rent' || Boolean(attrs.rental_start);
}

/** Total amount the customer paid for this rental line item. */
function getLineItemPaidAmount(lineItem: RentalHistoryLineItem): number {
  const amount =
    lineItem.currentTotalPrice?.amount ?? lineItem.totalPrice?.amount ?? '0';
  return Number(amount);
}

/**
 * Find the most recent prior rental of the given product.
 * Returns the rental fee paid, which becomes the rent-to-own credit.
 */
export function findPriorRentalCredit(
  orders: RentalHistoryOrder[],
  productId: string,
): number | null {
  for (const order of orders) {
    for (const lineItem of order.lineItems.nodes) {
      if (lineItem.productId !== productId) continue;
      if (!isRentalLineItem(lineItem)) continue;
      const paid = getLineItemPaidAmount(lineItem);
      if (paid > 0) return paid;
    }
  }
  return null;
}

/**
 * Build a rent-to-own offer when the customer previously rented this product.
 * Purchase price should be the item's full buy price (typically compareAtPrice).
 */
export function buildRentToOwnOffer(options: {
  productId: string;
  purchasePrice: number;
  orders: RentalHistoryOrder[];
}): RentToOwnOffer | undefined {
  const {productId, purchasePrice, orders} = options;
  if (purchasePrice <= 0) return undefined;

  const rentalCredit = findPriorRentalCredit(orders, productId);
  if (rentalCredit == null) return undefined;

  const buyNowPrice = Math.max(0, purchasePrice - rentalCredit);

  return {
    eligible: true,
    rentalCredit,
    buyNowPrice,
  };
}
