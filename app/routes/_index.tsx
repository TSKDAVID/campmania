import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import type {FeaturedProductsQuery} from 'storefrontapi.generated';
import {useLocale} from '~/providers/LocaleProvider';
import {ProductItem} from '~/components/ProductItem';
import {
  HomeCategories,
  HomeHowItWorksCompact,
  HomePerksStrip,
  HomeQuickNav,
  HomeSearchBar,
  HomeShopTiles,
} from '~/components/trailrent/HomeCommerce';
import {HomePromoCarousel} from '~/components/trailrent/HomePromoCarousel';
import {
  HOMEPAGE_PROMO_SLIDES_QUERY,
  parseHomepagePromoSlides,
} from '~/lib/trailrent/homepagePromo';
import {getLocaleFromRequest} from '~/providers/LocaleProvider';

export async function loader(args: Route.LoaderArgs) {
  const locale = getLocaleFromRequest(args.request);
  const featuredProducts = args.context.storefront
    .query(FEATURED_PRODUCTS_QUERY, {variables: {first: 8}})
    .catch(() => null);

  const promoSlides = args.context.storefront
    .query(HOMEPAGE_PROMO_SLIDES_QUERY)
    .then((response) => parseHomepagePromoSlides(response, locale))
    .catch(() => []);

  return {featuredProducts, promoSlides};
}

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Premium Hiking Gear Rental — Tbilisi'},
];

export default function Homepage() {
  const {featuredProducts, promoSlides} = useLoaderData<typeof loader>();

  return (
    <div className="cm-home">
      <div className="tr-page-width cm-home-top">
        <HomeSearchBar />
        <Suspense fallback={<HomePromoCarousel slides={null} />}>
          <Await resolve={promoSlides}>
            {(slides) => <HomePromoCarousel slides={slides} />}
          </Await>
        </Suspense>
        <HomeQuickNav />
      </div>

      <HomeCategories />

      <FeaturedProducts products={featuredProducts} />

      <div className="tr-page-width cm-home-bottom">
        <HomeShopTiles />
        <HomePerksStrip />
        <HomeHowItWorksCompact />
      </div>
    </div>
  );
}

function FeaturedProducts({
  products,
}: {
  products: Promise<FeaturedProductsQuery | null>;
}) {
  const {translations: tr} = useLocale();

  return (
    <section className="cm-home-products" aria-labelledby="home-products-heading">
      <div className="tr-page-width">
        <div className="cm-home-section-head">
          <div>
            <p className="tr-eyebrow">{tr.featured.eyebrow}</p>
            <h2 id="home-products-heading" className="cm-home-section-title">
              {tr.featured.title}
            </h2>
            <p className="cm-home-section-subtitle">{tr.featured.subtitle}</p>
          </div>
          <Link to="/collections/all" className="cm-home-section-link shrink-0">
            {tr.featured.viewAll}
            <span aria-hidden>→</span>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="cm-catalog-grid">
              {Array.from({length: 4}).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-xl bg-stone/60"
                />
              ))}
            </div>
          }
        >
          <Await resolve={products}>
            {(response) =>
              response?.products.nodes.length ? (
                <div className="cm-catalog-grid">
                  {response.products.nodes.map((product, index) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      loading={index < 4 ? 'eager' : 'lazy'}
                    />
                  ))}
                </div>
              ) : (
                <div className="cm-home-products-empty">
                  <p>{tr.featured.empty}</p>
                  <Link to="/packages" className="tr-btn-primary mt-4 inline-flex">
                    {tr.hero.ctaPackages}
                  </Link>
                </div>
              )
            }
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

const FEATURED_PRODUCT_FRAGMENT = `#graphql
  fragment FeaturedProduct on Product {
    id
    title
    handle
    featuredImage {
      id
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
      maxVariantPrice {
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
  }
` as const;

const FEATURED_PRODUCTS_QUERY = `#graphql
  query FeaturedProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int!
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        ...FeaturedProduct
      }
    }
  }
  ${FEATURED_PRODUCT_FRAGMENT}
` as const;
