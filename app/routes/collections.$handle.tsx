import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {PackageCollectionPage} from '~/components/trailrent/PackageCollectionPage';
import {loadPackageCollectionDetail} from '~/lib/trailrent/shopify-catalog';
import {getLocaleFromRequest} from '~/providers/LocaleProvider';
import {loadCustomerRentalContext} from '~/lib/trailrent/customer-rental-context';
import {liveStorefrontCache} from '~/lib/trailrent/storefront-live';

export const meta: Route.MetaFunction = ({data}) => {
  if (data?.view === 'package' && data.packageDetail) {
    return [{title: `Campmania | ${data.packageDetail.package.title}`}];
  }
  return [{title: `Campmania | ${data?.collection?.title ?? ''} Collection`}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const locale = getLocaleFromRequest(request);
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const packageDetail = await loadPackageCollectionDetail(
    storefront,
    handle,
    locale,
  ).catch(() => null);

  if (packageDetail) {
    const customerRentalContext = await loadCustomerRentalContext(context);
    return {
      view: 'package' as const,
      packageDetail,
      customerRentalContext,
    };
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
      ...liveStorefrontCache(storefront),
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    view: 'collection' as const,
    collection,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function CollectionRoute() {
  const data = useLoaderData<typeof loader>();

  if (data.view === 'package') {
    return (
      <PackageCollectionPage
        detail={data.packageDetail}
        customerRentalContext={data.customerRentalContext}
      />
    );
  }

  const {collection} = data;

  return (
    <section className="cm-doc-page">
      <h1 className="cm-doc-title">{collection.title}</h1>
      {collection.description ? (
        <p className="cm-doc-lead">{collection.description}</p>
      ) : null}
      <PaginatedResourceSection<ProductItemFragment>
        connection={collection.products}
        resourcesClassName="cm-catalog-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </section>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
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
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
