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
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {RentalProductForm} from '~/components/RentalProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {TrustNoticesInline} from '~/components/trailrent/ContentSections';
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

/**
 * Deferred customer context for rent-to-own and Trusted Tier status.
 * Uses Customer Account API — only fetched when the shopper is logged in.
 */
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

export default function Product() {
  const {product, customerRentalContext} = useLoaderData<typeof loader>();
  const {locale} = useLocale();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const {title, descriptionHtml, id: productId} = product;
  const dailyRate = Number(selectedVariant?.price?.amount ?? 0);
  const purchasePrice = Number(
    selectedVariant?.compareAtPrice?.amount ??
      selectedVariant?.price?.amount ??
      0,
  );

  return (
    <div className="tr-page-width tr-section">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImage image={selectedVariant?.image} />
        <div>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <div className="mt-4">
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>

          <Suspense
            fallback={
              <div className="mt-6">
                <TrustNoticesInline isTrustedTier={false} />
              </div>
            }
          >
            <Await resolve={customerRentalContext}>
              {(ctx) => (
                <div className="mt-6">
                  <TrustNoticesInline
                    isTrustedTier={isTrustedTier(ctx.tags)}
                  />
                </div>
              )}
            </Await>
          </Suspense>

          {selectedVariant?.id ? (
            <Suspense
              fallback={
                <div className="mt-8 animate-pulse rounded-md border border-stone bg-white p-6">
                  <div className="h-6 w-1/2 rounded bg-stone" />
                  <div className="mt-4 h-10 rounded bg-stone" />
                  <div className="mt-4 h-10 rounded bg-stone" />
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
            <p className="mt-8 rounded-md border border-stone bg-mist p-4 text-sm text-muted">
              {locale === 'ka'
                ? 'ეს ვარიანტი ამჟამად მიუწვდომელია.'
                : 'This variant is currently unavailable.'}
            </p>
          )}

          <div
            className="prose mt-10 max-w-none text-muted"
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
          />
        </div>
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
    </div>
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
