import {Await, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Suspense} from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductImage} from '~/components/ProductImage';
import {RentalProductForm} from '~/components/RentalProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  ProductDescription,
  ProductIncludedPanel,
  ProductPriceBlock,
  ProductTrustBar,
} from '~/components/trailrent/ProductPageSections';
import {useLocale} from '~/providers/LocaleProvider';
import {CUSTOMER_RENTAL_HISTORY_QUERY} from '~/graphql/customer-account/CustomerRentalHistoryQuery';
import {buildRentToOwnOffer} from '~/lib/trailrent/rent-to-own';
import {isTrustedTier, parseCustomerTags} from '~/lib/trailrent/loyalty';

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
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
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

function loadDeferredData({context}: Route.LoaderArgs) {
  const {customerAccount} = context;

  const customerRentalContext = customerAccount
    .isLoggedIn()
    .then(async (loggedIn) => {
      if (!loggedIn) {
        return {tags: [] as string[], orders: []};
      }

      const {data, errors} = await customerAccount.query(
        CUSTOMER_RENTAL_HISTORY_QUERY,
        {
          variables: {
            language: customerAccount.i18n.language,
            first: 25,
          },
        },
      );

      if (errors?.length || !data?.customer) {
        return {tags: [] as string[], orders: []};
      }

      return {
        tags: parseCustomerTags(data.customer.tags),
        orders: data.customer.orders.nodes,
      };
    })
    .catch(() => ({tags: [] as string[], orders: []}));

  return {customerRentalContext};
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

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const {title, descriptionHtml, id: productId, tags = []} = product;
  const dailyRate = Number(selectedVariant?.price?.amount ?? 0);
  const compareAt = Number(selectedVariant?.compareAtPrice?.amount ?? 0);
  const purchasePrice = Number(
    selectedVariant?.compareAtPrice?.amount ??
      selectedVariant?.price?.amount ??
      0,
  );
  const includedItems = parseIncludedItems(product.includedItems);
  const kitSummary = product.kitSummary?.value?.trim();
  const isPackage =
    includedItems.length > 0 || tags.some((t: string) => t.startsWith('trek-'));
  const savingsPercent =
    compareAt > dailyRate && compareAt > 0
      ? Math.round(((compareAt - dailyRate) / compareAt) * 100)
      : undefined;

  return (
    <article className="cm-product-page">
      <div className="tr-page-width cm-product-page-inner">
        <div className="cm-product-layout">
          <div className="cm-product-layout-media">
            <ProductImage image={selectedVariant?.image} title={title} />
          </div>

          <div className="cm-product-layout-details">
            <header className="cm-product-header">
              <p className="tr-eyebrow">
                {isPackage ? tr.packages.eyebrow : tr.product.rental}
              </p>
              <h1 className="cm-product-title">{title}</h1>
              {kitSummary ? (
                <p className="cm-product-subtitle">{kitSummary}</p>
              ) : null}
              <ProductPriceBlock
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
                savingsPercent={savingsPercent}
              />
            </header>

            <div className="cm-product-meta">
              <Suspense
                fallback={<ProductTrustBar isTrustedTier={false} />}
              >
                <Await resolve={customerRentalContext}>
                  {(ctx) => (
                    <ProductTrustBar isTrustedTier={isTrustedTier(ctx.tags)} />
                  )}
                </Await>
              </Suspense>

              {includedItems.length > 0 ? (
                <ProductIncludedPanel items={includedItems} />
              ) : null}
            </div>

            {selectedVariant?.id ? (
              <Suspense
                fallback={
                  <div className="cm-rental-form animate-pulse">
                    <div className="h-6 w-1/2 rounded-lg bg-stone" />
                    <div className="mt-6 h-10 rounded-lg bg-stone" />
                    <div className="mt-4 h-10 rounded-lg bg-stone" />
                    <div className="mt-6 h-12 rounded-lg bg-stone" />
                  </div>
                }
              >
                <Await resolve={customerRentalContext}>
                  {(ctx) => (
                    <RentalProductForm
                      variantId={selectedVariant.id}
                      productTitle={title}
                      dailyRate={dailyRate}
                      purchasePrice={purchasePrice}
                      rentToOwnOffer={buildRentToOwnOffer({
                        productId,
                        purchasePrice,
                        orders: ctx.orders,
                      })}
                      isTrustedTier={isTrustedTier(ctx.tags)}
                    />
                  )}
                </Await>
              </Suspense>
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
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
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
