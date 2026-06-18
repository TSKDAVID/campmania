import {useMemo, useState} from 'react';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductImage} from '~/components/ProductImage';
import {
  RentalProductForm,
  type FulfillmentMode,
} from '~/components/RentalProductForm';
import {INCLUSION_PRODUCT_FRAGMENT} from '~/graphql/storefront/CatalogProductsQuery';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  COLLECTION_PRODUCTS_QUERY,
  packageIncludesCollectionHandle,
  resolvePackagePricingFromCatalog,
} from '~/lib/trailrent/shopify-catalog';
import {liveStorefrontCache} from '~/lib/trailrent/storefront-live';
import type {PackageDuration} from '~/lib/trailrent/gear-builder';
import {
  ProductDescription,
  ProductIncludedPanel,
  ProductPriceBlock,
  ProductTrustBar,
} from '~/components/trailrent/ProductPageSections';
import {AddToGearBuilderButton} from '~/components/trailrent/AddToGearBuilderButton';
import {useLocale} from '~/providers/LocaleProvider';
import {loadCustomerRentalContext} from '~/lib/trailrent/customer-rental-context';
import {buildRentToOwnOffer} from '~/lib/trailrent/rent-to-own';
import {isTrustedTier} from '~/lib/trailrent/loyalty';
import {
  collectProductVariants,
  coalesceMetafieldValue,
  metafieldValueByKeys,
  resolveFulfillmentVariants,
} from '~/lib/trailrent/product-variants';
import {
  capacityFromVariantTitle,
  parseGearBuilderMetafields,
  type GearBuilderProduct,
} from '~/lib/trailrent/gear-builder';
import {isGearBuilderEnabled} from '~/lib/trailrent/feature-flags';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Campmania | ${data?.product.title ?? 'Product'}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const [criticalData, customerRentalContext] = await Promise.all([
    loadCriticalData(args),
    loadCustomerRentalContext(args.context),
  ]);

  return {
    ...criticalData,
    customerRentalContext,
    gearBuilderEnabled: isGearBuilderEnabled(args.context.env),
  };
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
      ...liveStorefrontCache(storefront),
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  const includedItems = await resolveIncludedItemTitles(storefront, product, handle);
  const packagePricing = await resolvePackagePricingForProduct(
    storefront,
    product,
    handle,
  );

  return {product, includedItems, packagePricing};
}

async function resolvePackagePricingForProduct(
  storefront: Route.LoaderArgs['context']['storefront'],
  product: {
    tags?: string[];
    includedCollection?: {
      reference?: {
        products?: {nodes?: Array<Record<string, unknown>> | null} | null;
      } | null;
    } | null;
  },
  handle: string,
) {
  const isPackage = (product.tags ?? []).some((tag: string) =>
    tag.startsWith('trek-'),
  );
  if (!isPackage) return null;

  let nodes = product.includedCollection?.reference?.products?.nodes ?? [];
  if (!nodes.length) {
    const conventionHandle = packageIncludesCollectionHandle(handle);
    const {collection} = await storefront
      .query(COLLECTION_PRODUCTS_QUERY, {
        variables: {handle: conventionHandle, first: 25},
        ...liveStorefrontCache(storefront),
      })
      .catch(() => ({collection: null}));

    nodes = collection?.products?.nodes ?? [];
  }
  if (!nodes.length) return null;

  const durationTag = (product.tags ?? []).find((tag: string) =>
    tag.startsWith('duration-'),
  );
  const duration = (durationTag?.slice('duration-'.length) ??
    '2-day') as PackageDuration;

  return resolvePackagePricingFromCatalog(nodes as never, duration);
}

async function resolveIncludedItemTitles(
  storefront: Route.LoaderArgs['context']['storefront'],
  product: {
    includedItems?: {value: string; type: string} | null;
    includedCollection?: {
      reference?: {
        products?: {nodes?: Array<{title: string}> | null} | null;
      } | null;
    } | null;
    tags?: string[];
  },
  handle: string,
): Promise<string[]> {
  const fromCollection =
    product.includedCollection?.reference?.products?.nodes ?? [];
  if (fromCollection.length > 0) {
    return fromCollection.map((node) => node.title);
  }

  const isPackage =
    (product.tags ?? []).some((tag: string) => tag.startsWith('trek-'));
  if (isPackage) {
    const conventionHandle = packageIncludesCollectionHandle(handle);
    const {collection} = await storefront
      .query(COLLECTION_PRODUCTS_QUERY, {
        variables: {handle: conventionHandle, first: 25},
        ...liveStorefrontCache(storefront),
      })
      .catch(() => ({collection: null}));

    const nodes = collection?.products?.nodes ?? [];
    if (nodes.length > 0) {
      return nodes.map((node: {title: string}) => node.title);
    }
  }

  return parseIncludedItems(product.includedItems);
}

function parseIncludedItems(metafield?: {value: string; type: string} | null): string[] {
  if (!metafield?.value) return [];
  try {
    const parsed = JSON.parse(metafield.value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    // fall through — treat as newline list
  }
  return metafield.value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function Product() {
  const {
    product,
    includedItems,
    packagePricing,
    customerRentalContext,
    gearBuilderEnabled,
  } = useLoaderData<typeof loader>();
  const {locale, translations: tr} = useLocale();
  const [fulfillmentMode, setFulfillmentMode] =
    useState<FulfillmentMode>('rent');

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const {title, descriptionHtml, id: productId, tags = []} = product;
  const isSoloProduct = includedItems.length === 0;
  const isPackage =
    includedItems.length > 0 || tags.some((t: string) => t.startsWith('trek-'));

  const fulfillment = useMemo(() => {
    const variants = collectProductVariants(product);
    const availableMeta = coalesceMetafieldValue(
      metafieldValueByKeys(product.fulfillmentMetafields, [
        'available-to-purchase',
        'available_for_purchase',
      ]),
      product.availableForPurchase?.value,
      product.availableForPurchaseAlt?.value,
    );
    const purchaseMeta = coalesceMetafieldValue(
      metafieldValueByKeys(product.fulfillmentMetafields, [
        'purchase-price',
        'purchase_price',
      ]),
      product.purchasePriceMeta?.value,
      product.purchasePriceMetaAlt?.value,
    );

    return resolveFulfillmentVariants({
      variants,
      availableForPurchaseMeta: availableMeta,
      purchasePriceMeta: purchaseMeta,
    });
  }, [product]);

  const rentVariant = fulfillment?.rentVariant;
  const buyVariant = fulfillment?.buyVariant;
  const buyCheckoutReady = fulfillment?.buyCheckoutReady ?? false;
  const dailyRate = Number(rentVariant?.price?.amount ?? 0);
  const displayDailyRate = packagePricing?.bundleDaily ?? dailyRate;
  let purchasePrice = fulfillment?.purchasePrice ?? 0;
  const compareAt = Number(rentVariant?.compareAtPrice?.amount ?? 0);
  const displayCompareAt = packagePricing?.subtotalDaily ?? compareAt;
  if (purchasePrice <= 0 && compareAt > dailyRate) {
    purchasePrice = compareAt;
  }
  const buyAvailableRaw =
    (fulfillment?.buyAvailable ?? false) ||
    (purchasePrice > dailyRate && compareAt > dailyRate);
  /** Trail packages are rental bundles only — compare-at is kit savings, not a buy price. */
  const buyAvailable = isPackage ? false : buyAvailableRaw;
  const buyPriceMoney: MoneyV2 | undefined =
    purchasePrice > 0
      ? {
          amount: String(purchasePrice),
          currencyCode:
            (buyVariant?.price.currencyCode ??
              rentVariant?.price.currencyCode ??
              'GEL') as MoneyV2['currencyCode'],
        }
      : undefined;

  const kitSummary = product.kitSummary?.value?.trim();
  const productSubtitle = kitSummary || product.description?.trim();
  const savingsPercent =
    !buyAvailable &&
    displayCompareAt > displayDailyRate &&
    displayCompareAt > 0
      ? Math.round(((displayCompareAt - displayDailyRate) / displayCompareAt) * 100)
      : packagePricing?.discountPercent;
  const displayRentPrice: MoneyV2 | undefined =
    displayDailyRate > 0
      ? {
          amount: String(displayDailyRate),
          currencyCode:
            (rentVariant?.price.currencyCode ?? 'GEL') as MoneyV2['currencyCode'],
        }
      : (rentVariant?.price as MoneyV2 | undefined);
  const displayCompareAtPrice: MoneyV2 | null | undefined =
    displayCompareAt > displayDailyRate
      ? {
          amount: String(displayCompareAt),
          currencyCode:
            (rentVariant?.compareAtPrice?.currencyCode ??
              rentVariant?.price.currencyCode ??
              'GEL') as MoneyV2['currencyCode'],
        }
      : (rentVariant?.compareAtPrice as MoneyV2 | null | undefined);

  const trustedTier = isTrustedTier(customerRentalContext.tags);
  const rentToOwnOffer = buildRentToOwnOffer({
    productId,
    purchasePrice,
    orders: customerRentalContext.orders,
  });

  const bookingFormProps = rentVariant?.id
    ? {
        rentVariantId: rentVariant.id,
        buyVariantId: buyVariant?.id,
        buyAvailable,
        buyCheckoutReady,
        productTitle: title,
        dailyRate: displayDailyRate,
        purchasePrice,
        rentToOwnOffer,
        isTrustedTier: trustedTier,
        onModeChange: setFulfillmentMode,
      }
    : null;

  const builderProduct = useMemo((): GearBuilderProduct | null => {
    if (!gearBuilderEnabled || isPackage) return null;
    const variants = (product.variants?.nodes ?? []).map(
      (entry: NonNullable<typeof product.variants>['nodes'][number]) => ({
      id: entry.id,
      title: entry.title ?? '',
      availableForSale: entry.availableForSale !== false,
      price: Number(entry.price.amount),
      capacityLiters: capacityFromVariantTitle(entry.title ?? ''),
      }),
    );
    const metafields = parseGearBuilderMetafields({
      itemType: product.gearItemType?.value,
      builderEnabled: product.gearBuilderEnabled?.value,
      capacityLiters: product.gearCapacityLiters?.value,
      capacityClass: product.gearCapacityClass?.value,
      durationFit: product.gearDurationFit?.value,
      thumbnailPriority: product.gearThumbnailPriority?.value,
    });
    const category = tags.find((t: string) => t.startsWith('gear-'))?.slice(5);
    if (!product.gearBuilderEnabled?.value && !product.gearItemType?.value && category) {
      metafields.itemType =
        category === 'sleeping'
          ? 'sleeping_bag'
          : category === 'electronics'
            ? 'lighting'
            : (category as GearBuilderProduct['metafields']['itemType']);
      metafields.builderEnabled = true;
    }
    return {
      id: product.id,
      handle: product.handle,
      title,
      imageUrl: selectedVariant?.image?.url ?? rentVariant?.image?.url,
      dailyRate,
      variantId: rentVariant?.id,
      availableForSale: rentVariant?.availableForSale !== false,
      metafields,
      variants,
    };
  }, [gearBuilderEnabled, isPackage, product, tags, title, dailyRate, rentVariant, selectedVariant]);

  return (
    <article className="cm-product-page">
      <div
        className={`cm-product-page-inner${isSoloProduct ? ' cm-product-page-inner--solo' : ''}`}
      >
        <div
          className={`cm-product-layout${
            isSoloProduct ? ' cm-product-layout--solo' : ' cm-product-layout--package'
          }`}
        >
          <header className="cm-product-header cm-product-header--media-top cm-product-layout-title">
            <p className="cm-product-eyebrow">
              {isPackage ? tr.packages.eyebrow : tr.product.rental}
            </p>
            <h1 className="cm-product-title">{title}</h1>
          </header>

          <div className="cm-product-media-pricing">
            <ProductPriceBlock
              fulfillmentMode={fulfillmentMode}
              rentPrice={displayRentPrice}
              buyPrice={buyPriceMoney}
              buyAvailable={buyAvailable}
              compareAtPrice={displayCompareAtPrice}
              savingsPercent={savingsPercent}
            />
            <ProductTrustBar isTrustedTier={trustedTier} />
          </div>

          <aside className="cm-product-layout-media" aria-label={title}>
            <ProductImage
              image={selectedVariant?.image ?? rentVariant?.image}
              title={title}
              variant={isSoloProduct ? 'solo' : 'kit'}
            />
            {productSubtitle ? (
              <div className="cm-product-media-caption">
                <p className="cm-product-subtitle">{productSubtitle}</p>
              </div>
            ) : null}
          </aside>

          <div className="cm-product-buybox">
            {includedItems.length > 0 ? (
              <div className="cm-product-buybox-card">
                <ProductIncludedPanel items={includedItems} />

                {bookingFormProps ? (
                  <RentalProductForm {...bookingFormProps} layout="wide" compact />
                ) : (
                  <p className="cm-product-unavailable cm-product-unavailable--in-card">
                    {locale === 'ka'
                      ? 'ეს ვარიანტი ამჟამად მიუწვდომელია.'
                      : 'This variant is currently unavailable.'}
                  </p>
                )}
              </div>
            ) : bookingFormProps ? (
              <div className="cm-product-booking">
                <RentalProductForm {...bookingFormProps} layout="wide" compact />
                {builderProduct ? (
                  <AddToGearBuilderButton
                    product={builderProduct}
                    variantId={rentVariant?.id}
                  />
                ) : null}
              </div>
            ) : (
              <p className="cm-product-unavailable">
                {locale === 'ka'
                  ? 'ეს ვარიანტი ამჟამად მიუწვდომელია.'
                  : 'This variant is currently unavailable.'}
              </p>
            )}
          </div>
        </div>

        <ProductDescription html={descriptionHtml} title={tr.product.about} />
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: rentVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: rentVariant?.id || '',
              variantTitle: rentVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </article>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    variants(first: 25) {
      nodes {
        ...ProductVariant
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    tags
    includedItems: metafield(namespace: "custom", key: "included_items") {
      value
      type
    }
    includedCollection: metafield(namespace: "custom", key: "included_collection") {
      reference {
        ... on Collection {
          handle
          products(first: 25) {
            nodes {
              ...InclusionProduct
            }
          }
        }
      }
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
  }
  ${PRODUCT_VARIANT_FRAGMENT}
  ${INCLUSION_PRODUCT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
