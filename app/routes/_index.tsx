import {Await, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {HomeHero} from '~/components/home/HomeHero';
import {HomeKitsGrid} from '~/components/home/HomeKitsGrid';
import {HomeHowItWorks} from '~/components/home/HomeHowItWorks';
import {HomeDeliveryStrip} from '~/components/home/HomeDeliveryStrip';
import {HomeFeaturedRoutes} from '~/components/home/HomeFeaturedRoutes';
import {HomeReviewsStrip} from '~/components/home/HomeReviewsStrip';
import {HomeBlogTeaser} from '~/components/home/HomeBlogTeaser';
import {
  loadHomepageFeaturedSections,
} from '~/lib/trailrent/shopify-catalog';
import {
  HOMEPAGE_PROMO_SLIDES_QUERY,
  parseHomepagePromoSlides,
} from '~/lib/trailrent/homepagePromo';
import {getLocaleFromRequest} from '~/providers/LocaleProvider';

const BLOG_TEASER_QUERY = `#graphql
  query BlogTeaser($language: LanguageCode, $country: CountryCode)
  @inContext(language: $language, country: $country) {
    blogs(first: 1) {
      nodes {
        handle
        articles(first: 2, sortKey: PUBLISHED_AT, reverse: true) {
          nodes {
            id
            title
            handle
            publishedAt
            excerpt
          }
        }
      }
    }
  }
` as const;

export async function loader(args: Route.LoaderArgs) {
  const locale = getLocaleFromRequest(args.request);
  const featuredSections = loadHomepageFeaturedSections(
    args.context.storefront,
    locale,
    {packageLimit: 6, gearLimit: 4},
  ).catch(() => ({packages: [], gear: [], gearCatalog: []}));

  const promoSlides = args.context.storefront
    .query(HOMEPAGE_PROMO_SLIDES_QUERY)
    .then((response) => parseHomepagePromoSlides(response, locale))
    .catch(() => []);

  const blogTeaser = args.context.storefront
    .query(BLOG_TEASER_QUERY)
    .then((data) => {
      const blog = data?.blogs?.nodes?.[0];
      if (!blog) return [];
      return (blog.articles?.nodes ?? []).map((article) => ({
        id: article.id,
        title: article.title,
        handle: article.handle,
        publishedAt: article.publishedAt,
        excerpt: article.excerpt,
        blogHandle: blog.handle,
      }));
    })
    .catch(() => []);

  return {featuredSections, promoSlides, blogTeaser};
}

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Premium Gear Rental — Tbilisi'},
];

export default function Homepage() {
  const {featuredSections, promoSlides, blogTeaser} =
    useLoaderData<typeof loader>();

  return (
    <div className="cm-home">
      <Suspense
        fallback={
          <section className="cm-home-hero">
            <div className="cm-home-hero__inner">
              <div className="cm-home-hero__text">
                <div className="cm-skeleton cm-skeleton--title" />
              </div>
            </div>
          </section>
        }
      >
        <Await resolve={promoSlides}>
          {(slides) => <HomeHero promoSlides={slides} />}
        </Await>
      </Suspense>

      <Suspense
        fallback={
          <section className="cm-home-section">
            <div className="cm-container">
              <div className="cm-skeleton cm-skeleton--title" />
            </div>
          </section>
        }
      >
        <Await resolve={featuredSections}>
          {({packages}) => <HomeKitsGrid packages={packages} />}
        </Await>
      </Suspense>

      <HomeHowItWorks />
      <HomeDeliveryStrip />
      <HomeFeaturedRoutes />
      <HomeReviewsStrip />

      <Suspense fallback={null}>
        <Await resolve={blogTeaser}>
          {(articles) => <HomeBlogTeaser articles={articles} />}
        </Await>
      </Suspense>
    </div>
  );
}
