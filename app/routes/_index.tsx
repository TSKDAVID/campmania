import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {useLocale} from '~/providers/LocaleProvider';
import {CatalogProductCard} from '~/components/trailrent/CatalogProductCard';
import {PriceWithCompare} from '~/components/trailrent/PriceWithCompare';
import {
  HomeCategories,
  HomeHowItWorksCompact,
  HomePerksStrip,
  HomeQuickNav,
  HomeShopTiles,
} from '~/components/trailrent/HomeCommerce';
import {HomePromoCarousel} from '~/components/trailrent/HomePromoCarousel';
import {
  HOMEPAGE_PROMO_SLIDES_QUERY,
  parseHomepagePromoSlides,
} from '~/lib/trailrent/homepagePromo';
import {
  loadHomepageFeaturedItems,
  type HomepageFeaturedItem,
} from '~/lib/trailrent/shopify-catalog';
import {getLocaleFromRequest} from '~/providers/LocaleProvider';

export async function loader(args: Route.LoaderArgs) {
  const locale = getLocaleFromRequest(args.request);
  const featuredProducts = loadHomepageFeaturedItems(
    args.context.storefront,
    locale,
    {limit: 8},
  ).catch(() => [] as HomepageFeaturedItem[]);

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
      <header className="cm-home-header">
        <div className="cm-home-hero cm-home-hero-bleed">
          <Suspense fallback={<HomePromoCarousel slides={null} />}>
            <Await resolve={promoSlides}>
              {(slides) => <HomePromoCarousel slides={slides} />}
            </Await>
          </Suspense>
        </div>
        <div className="cm-home-width cm-home-top-bar">
          <HomeQuickNav />
        </div>
      </header>

      <HomeCategories />

      <FeaturedProducts products={featuredProducts} />

      <div className="cm-home-width cm-home-bottom">
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
  products: Promise<HomepageFeaturedItem[]>;
}) {
  const {translations: tr, locale} = useLocale();
  const perDay = locale === 'ka' ? '/ დღე' : '/ day';

  return (
    <section className="cm-home-products" aria-labelledby="home-products-heading">
      <div className="cm-home-width">
        <div className="cm-home-section-head">
          <div>
            <p className="tr-eyebrow">{tr.featured.eyebrow}</p>
            <h2 id="home-products-heading" className="cm-home-section-title">
              {tr.featured.title}
            </h2>
            <p className="cm-home-section-subtitle">{tr.featured.subtitle}</p>
          </div>
          <Link to="/packages" className="cm-home-section-link shrink-0">
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
            {(items) =>
              items.length ? (
                <div className="cm-catalog-grid">
                  {items.map((item, index) => (
                    <CatalogProductCard
                      key={item.id}
                      to={item.url}
                      title={item.title}
                      imageUrl={item.imageUrl}
                      imageAlt={item.imageAlt ?? item.title}
                      loading={index < 4 ? 'eager' : 'lazy'}
                      price={
                        item.dailyRate > 0 ? (
                          <PriceWithCompare
                            amount={item.dailyRate}
                            compareAtAmount={item.compareAt}
                            suffix={` ${perDay}`}
                          />
                        ) : null
                      }
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
