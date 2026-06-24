/** Storefront queries for Campmania package & gear collections. */

/** Products inside a package's included-collection (kit contents). */
export const INCLUSION_PRODUCT_FRAGMENT = `#graphql
  fragment InclusionProduct on Product {
    id
    handle
    title
    tags
    featuredImage {
      url
      altText
    }
    priceRange {
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
    fulfillmentMetafields: metafields(
      identifiers: [
        {namespace: "custom", key: "available-to-purchase"},
        {namespace: "custom", key: "available_for_purchase"},
        {namespace: "custom", key: "purchase-price"},
        {namespace: "custom", key: "purchase_price"},
      ]
    ) {
      key
      value
      type
    }
  }
` as const;

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
    media(first: 5) {
      nodes {
        ... on MediaImage {
          id
          image {
            url
            altText
          }
        }
      }
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
    includedCollection: metafield(namespace: "custom", key: "included_collection") {
      value
      reference {
        ... on Collection {
          handle
          image {
            url
            altText
          }
          products(first: 25) {
            nodes {
              ...InclusionProduct
            }
          }
        }
      }
    }
  }
  ${INCLUSION_PRODUCT_FRAGMENT}
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
      image {
        url
        altText
      }
      products(first: $first) {
        nodes {
          ...CatalogProduct
        }
      }
    }
  }
  ${CATALOG_PRODUCT_FRAGMENT}
` as const;

/** All collections — filter client-side for trail package collections (`theme_template` = packages). */
export const PACKAGE_COLLECTIONS_QUERY = `#graphql
  query PackageCollections(
    $country: CountryCode
    $language: LanguageCode
    $first: Int!
  ) @inContext(country: $country, language: $language) {
    collections(first: $first) {
      nodes {
        id
        title
        handle
        description
        image {
          url
          altText
        }
        themeTemplate: metafield(namespace: "custom", key: "theme_template") {
          value
        }
        isPackage: metafield(namespace: "custom", key: "is_package") {
          value
        }
        trekMeta: metafield(namespace: "custom", key: "trek") {
          value
        }
        durationMeta: metafield(namespace: "custom", key: "duration") {
          value
        }
        difficultyMeta: metafield(namespace: "custom", key: "difficulty") {
          value
        }
        includedKitCollection: metafield(namespace: "custom", key: "included_collection") {
          reference {
            ... on Collection {
              handle
              products(first: 50) {
                nodes {
                  ...InclusionProduct
                }
              }
            }
          }
        }
        products(first: 50) {
          nodes {
            ...InclusionProduct
          }
        }
      }
    }
  }
  ${INCLUSION_PRODUCT_FRAGMENT}
` as const;

/** Find package product by trek tag when listing collection is incomplete. */
export const PACKAGE_PRODUCT_BY_TREK_QUERY = `#graphql
  query PackageProductByTrekTag(
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: 5, query: $query) {
      nodes {
        id
        handle
        includedCollection: metafield(namespace: "custom", key: "included_collection") {
          reference {
            ... on Collection {
              handle
            }
          }
        }
      }
    }
  }
` as const;
