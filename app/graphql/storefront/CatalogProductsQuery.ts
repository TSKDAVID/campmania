/** Storefront queries for Campmania package & gear collections. */

export const CATALOG_PRODUCT_FRAGMENT = `#graphql
  fragment CatalogProduct on Product {
    id
    handle
    title
    description
    tags
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      availableForSale
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
    }
    includedItems: metafield(namespace: "custom", key: "included_items") {
      value
      type
    }
    kitSummary: metafield(namespace: "custom", key: "kit_summary") {
      value
    }
    availableForPurchase: metafield(namespace: "custom", key: "available-to-purchase") {
      value
    }
    availableForPurchaseAlt: metafield(namespace: "custom", key: "available_for_purchase") {
      value
    }
    purchasePriceMeta: metafield(namespace: "custom", key: "purchase-price") {
      value
    }
    purchasePriceMetaAlt: metafield(namespace: "custom", key: "purchase_price") {
      value
    }
    gearItemType: metafield(namespace: "gear_builder", key: "item_type") {
      value
    }
    gearBuilderEnabled: metafield(namespace: "gear_builder", key: "builder_enabled") {
      value
    }
    gearCapacityLiters: metafield(namespace: "gear_builder", key: "capacity_liters") {
      value
    }
    gearCapacityClass: metafield(namespace: "gear_builder", key: "capacity_class") {
      value
    }
    gearDurationFit: metafield(namespace: "gear_builder", key: "duration_fit") {
      value
    }
    gearThumbnailPriority: metafield(namespace: "gear_builder", key: "thumbnail_priority") {
      value
    }
    includedProductHandles: metafield(namespace: "custom", key: "included_product_handles") {
      value
    }
  }
` as const;

export const COLLECTION_PRODUCTS_QUERY = `#graphql
  query CollectionProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: $first) {
        nodes {
          ...CatalogProduct
        }
      }
    }
  }
  ${CATALOG_PRODUCT_FRAGMENT}
` as const;
