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
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  ProductDescription,
  ProductIncludedPanel,
  ProductPriceBlock,
  ProductTrustBar,
} from '~/components/trailrent/ProductPageSections';
import {useLocale} from '~/providers/LocaleProvider';
import {loadCustomerRentalContext} from '~/lib/trailrent/customer-rental-context';
import {buildRentToOwnOffer} from '~/lib/trailrent/rent-to-own';
import {isTrustedTier} from '~/lib/trailrent/loyalty';
import {
  collectProductVariants,
  coalesceMetafieldValue,
  resolveFulfillmentVariants,
} from '~/lib/trailrent/product-variants';

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

  return {...criticalData, customerRentalContext};
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
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
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
  const {product, customerRentalContext} = useLoaderData<typeof loader>();
  const {locale, translations: tr} = useLocale();
  const [fulfillmentMode, setFulfillmentMode] =
    useState<FulfillmentMode>('rent');

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const fulfillment = useMemo(() => {
    const variants = collectProductVariants(product);
    return resolveFulfillmentVariants({
      variants,
      availableForPurchaseMeta: coalesceMetafieldValue(
        product.availableForPurchase?.value,
        product.availableForPurchaseAlt?.value,
      ),
      purchasePriceMeta: coalesceMetafieldValue(
        product.purchasePriceMeta?.value,
        product.purchasePriceMetaAlt?.value,
      ),
    });
  }, [product]);

  const rentVariant = fulfillment?.rentVariant;
  const buyVariant = fulfillment?.buyVariant;
  const buyAvailable = fulfillment?.buyAvailable ?? false;
  const buyCheckoutReady = fulfillment?.buyCheckoutReady ?? false;

  const {title, descriptionHtml, id: productId, tags = []} = product;
  const dailyRate = Number(rentVariant?.price?.amount ?? 0);
  const purchasePrice = fulfillment?.purchasePrice ?? 0;
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
  const compareAt = Number(rentVariant?.compareAtPrice?.amount ?? 0);
  const includedItems = parseIncludedItems(product.includedItems);
  const kitSummary = product.kitSummary?.value?.trim();
  const isPackage =
    includedItems.length > 0 || tags.some((t: string) => t.startsWith('trek-'));
  const savingsPercent =
    compareAt > dailyRate && compareAt > 0
      ? Math.round(((compareAt - dailyRate) / compareAt) * 100)
      : undefined;

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
        dailyRate,
        purchasePrice,
        rentToOwnOffer,
        isTrustedTier: trustedTier,
        onModeChange: setFulfillmentMode,
        compact: true as const,
      }
    : null;

  return (
    <article className="cm-product-page">
      <div className="cm-product-page-inner">
        <div
          className={`cm-product-layout${
            includedItems.length === 0 ? ' cm-product-layout--solo' : ''
          }`}
        >
          <aside className="cm-product-layout-media" aria-label={title}>
            <ProductImage
              image={selectedVariant?.image ?? rentVariant?.image}
              title={title}
              variant={includedItems.length === 0 ? 'solo' : 'kit'}
            />
          </aside>

          <div className="cm-product-buybox">
            <header className="cm-product-header">
              <p className="tr-eyebrow">
                {isPackage ? tr.packages.eyebrow : tr.product.rental}
              </p>
              <h1 className="cm-product-title">{title}</h1>
              {kitSummary ? (
                <p className="cm-product-subtitle">{kitSummary}</p>
              ) : null}
              <ProductPriceBlock
                fulfillmentMode={fulfillmentMode}
                rentPrice={rentVariant?.price as MoneyV2 | undefined}
                buyPrice={buyPriceMoney}
                buyAvailable={buyAvailable}
                compareAtPrice={rentVariant?.compareAtPrice as MoneyV2 | null | undefined}
                savingsPercent={savingsPercent}
              />
            </header>

            <ProductTrustBar isTrustedTier={trustedTier} />

            {includedItems.length > 0 ? (
              <div className="cm-product-buybox-panels">
                <ProductIncludedPanel items={includedItems} />

                {bookingFormProps ? (
                  <RentalProductForm {...bookingFormProps} />
                ) : (
                  <p className="cm-product-unavailable">
                    {locale === 'ka'
                      ? 'ეს ვარიანტი ამჟამად მიუწვდომელია.'
                      : 'This variant is currently unavailable.'}
                  </p>
                )}
              </div>
            ) : bookingFormProps ? (
              <div className="cm-product-booking">
                <RentalProductForm {...bookingFormProps} layout="wide" />
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
  }
  ${PRODUCT_VARIANT_FRAGMENT}
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
