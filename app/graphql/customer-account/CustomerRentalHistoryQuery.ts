/**
 * Fetches recent customer orders with line-item details needed for
 * rent-to-own eligibility (productId, rental attributes, paid amount).
 */
export const RENTAL_HISTORY_LINE_ITEM_FRAGMENT = `#graphql
  fragment RentalHistoryLineItem on LineItem {
    id
    productId
    variantId
    title
    customAttributes {
      key
      value
    }
    totalPrice {
      amount
      currencyCode
    }
    currentTotalPrice {
      amount
      currencyCode
    }
  }
` as const;

export const RENTAL_HISTORY_ORDER_FRAGMENT = `#graphql
  fragment RentalHistoryOrder on Order {
    id
    processedAt
    fulfillmentStatus
    lineItems(first: 50) {
      nodes {
        ...RentalHistoryLineItem
      }
    }
  }
  ${RENTAL_HISTORY_LINE_ITEM_FRAGMENT}
` as const;

export const CUSTOMER_RENTAL_HISTORY_QUERY = `#graphql
  query CustomerRentalHistory(
    $language: LanguageCode
    $first: Int
  ) @inContext(language: $language) {
    customer {
      tags
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          ...RentalHistoryOrder
        }
      }
    }
  }
  ${RENTAL_HISTORY_ORDER_FRAGMENT}
` as const;
