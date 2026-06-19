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
  loadHomepageFeaturedSections,
  type HomepageFeaturedItem,
} from '~/lib/trailrent/shopify-catalog';
import {getLocaleFromRequest} from '~/providers/LocaleProvider';

export async function loader(args: Route.LoaderArgs) {
  const locale = getLocaleFromRequest(args.request);
  const featuredSections = loadHomepageFeaturedSections(
    args.context.storefront,
    locale,
    {packageLimit: 4, gearLimit: 4},
  ).catch(() => ({packages: [], gear: []}));

  const promoSlides = args.context.storefront
    .query(HOMEPAGE_PROMO_SLIDES_QUERY)
    .then((response) => parseHomepagePromoSlides(response, locale))
    .catch(() => []);

  return {featuredSections, promoSlides};
}

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Premium Hiking Gear Rental — Tbilisi'},
];

export default function Homepage() {
  const {featuredSections, promoSlides} = useLoaderData<typeof loader>();

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

      <FeaturedProducts sections={featuredSections} />

      <div className="cm-home-width cm-home-bottom">
        <HomeShopTiles />
        <HomePerksStrip />
        <HomeHowItWorksCompact />
      </div>
    </div>
  );
}

function FeaturedProducts({
  sections,
}: {
  sections: Promise<{packages: HomepageFeaturedItem[]; gear: HomepageFeaturedItem[]}>;
}) {
  const {translations: tr, locale} = useLocale();
  const perDay = locale === 'ka' ? '/ დღე' : '/ day';

  return (
    <Suspense
      fallback={
        <>
          <FeaturedSectionSkeleton />
          <FeaturedSectionSkeleton />
        </>
      }
    >
      <Await resolve={sections}>
        {({packages, gear}) => (
          <>
            <FeaturedSection
              id="home-packages-heading"
              copy={tr.featured.packages}
              viewAllHref="/packages"
              items={packages}
              perDay={perDay}
              variant="package"
              gridClassName="cm-catalog-grid cm-catalog-grid--packages"
              emptyCta={{label: tr.hero.ctaPackages, href: '/packages'}}
            />
            <FeaturedSection
              id="home-gear-heading"
              copy={tr.featured.gear}
              viewAllHref="/individual-gear"
              items={gear}
              perDay={perDay}
              variant="product"
              gridClassName="cm-catalog-grid"
              emptyCta={{label: tr.hero.ctaGear, href: '/individual-gear'}}
            />
          </>
        )}
      </Await>
    </Suspense>
  );
}

function FeaturedSectionSkeleton() {
  return (
    <section className="cm-home-products">
      <div className="cm-home-width">
        <div className="cm-catalog-grid">
          {Array.from({length: 4}).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-xl bg-stone/60"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedSection({
  id,
  copy,
  viewAllHref,
  items,
  perDay,
  variant,
  gridClassName,
  emptyCta,
}: {
  id: string;
  copy: {
    eyebrow: string;
    title: string;
    subtitle: string;
    viewAll: string;
    empty: string;
  };
  viewAllHref: string;
  items: HomepageFeaturedItem[];
  perDay: string;
  variant: 'product' | 'package';
  gridClassName: string;
  emptyCta: {label: string; href: string};
}) {
  return (
    <section className="cm-home-products" aria-labelledby={id}>
      <div className="cm-home-width">
        <div className="cm-home-section-head">
          <div>
            <p className="tr-eyebrow">{copy.eyebrow}</p>
            <h2 id={id} className="cm-home-section-title">
              {copy.title}
            </h2>
            <p className="cm-home-section-subtitle">{copy.subtitle}</p>
          </div>
          <Link to={viewAllHref} className="cm-home-section-link shrink-0">
            {copy.viewAll}
            <span aria-hidden>→</span>
          </Link>
        </div>

        {items.length ? (
          <div className={gridClassName}>
            {items.map((item, index) => (
              <CatalogProductCard
                key={item.id}
                to={item.url}
                title={item.title}
                imageUrl={item.imageUrl}
                imageUrls={item.imageUrls}
                imageAlt={item.imageAlt ?? item.title}
                loading={index < 4 ? 'eager' : 'lazy'}
                variant={variant}
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
            <p>{copy.empty}</p>
            <Link to={emptyCta.href} className="tr-btn-primary mt-4 inline-flex">
              {emptyCta.label}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
