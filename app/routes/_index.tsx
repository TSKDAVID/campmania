import {Await, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {AdventureHero} from '~/components/trailrent/HomeSections';
import {
  HowItWorksSection,
  CategoryGridSection,
  WhyUsSection,
  ReviewsSection,
  FaqSection,
  CtaSection,
} from '~/components/trailrent/ContentSections';
import {SectionHeading} from '~/components/trailrent/HomeSections';
import {useLocale} from '~/providers/LocaleProvider';

export const meta: Route.MetaFunction = () => [
  {title: 'TrailRent | Premium Hiking Gear Rental — Tbilisi'},
];

export async function loader(args: Route.LoaderArgs) {
  const recommendedProducts = args.context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch(() => null);

  return {
    isShopLinked: Boolean(args.context.env.PUBLIC_STORE_DOMAIN),
    recommendedProducts,
  };
}

export default function Homepage() {
  const {recommendedProducts} = useLoaderData<typeof loader>();

  return (
    <div>
      <AdventureHero />
      <HowItWorksSection />
      <FeaturedProducts products={recommendedProducts} />
      <CategoryGridSection />
      <WhyUsSection />
      <ReviewsSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}

function FeaturedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  const {translations: tr, locale} = useLocale();

  return (
    <section className="tr-section bg-mist">
      <div className="tr-page-width">
        <SectionHeading
          eyebrow={locale === 'ka' ? 'პოპულარული' : 'Popular'}
          title={locale === 'ka' ? 'რჩეული აღჭურვილობა' : 'Featured gear'}
          subtitle={
            locale === 'ka'
              ? 'Shopify-დან — დააკავშირეთ მაღაზია რეალური პროდუქტებისთვის.'
              : 'From Shopify — link your store for live inventory.'
          }
        />
        <Suspense fallback={<p className="text-muted">Loading...</p>}>
          <Await resolve={products}>
            {(response) =>
              response?.products.nodes.length ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="text-muted">
                  {locale === 'ka'
                    ? 'დაუკავშირეთ Shopify მაღაზია ან გამოიყენეთ კომპლექტების კატალოგი.'
                    : 'Connect Shopify or browse our package catalog.'}
                </p>
              )
            }
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
