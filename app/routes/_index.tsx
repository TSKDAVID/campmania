import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {useLocale} from '~/providers/LocaleProvider';
import {CatalogProductCard} from '~/components/trailrent/CatalogProductCard';
import {CampManiaHero} from '~/components/trailrent/CampManiaHero';
import {PackageCard} from '~/components/trailrent/PackageCard';
import {PriceWithCompare} from '~/components/trailrent/PriceWithCompare';
import {DURATION_FILTERS} from '~/lib/trailrent/catalog';
import {
  HomeCategories,
  HomeHowItWorksCompact,
  HomePerksStrip,
  HomeQuickNav,
  HomeShopTiles,
} from '~/components/trailrent/HomeCommerce';
import {HomepageSectionNav} from '~/components/trailrent/HomepageSectionNav';
import {
  loadHomepageFeaturedSections,
  type HomepageFeaturedItem,
  type ShopifyGearItem,
  type ShopifyPackageItem,
} from '~/lib/trailrent/shopify-catalog';
import {
  HOMEPAGE_PROMO_SLIDES_QUERY,
  parseHomepagePromoSlides,
} from '~/lib/trailrent/homepagePromo';
import {getLocaleFromRequest} from '~/providers/LocaleProvider';

export async function loader(args: Route.LoaderArgs) {
  const locale = getLocaleFromRequest(args.request);
  const featuredSections = loadHomepageFeaturedSections(
    args.context.storefront,
    locale,
    {packageLimit: 4, gearLimit: 4},
  ).catch(() => ({packages: [], gear: [], gearCatalog: []}));

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
  const {featuredSections} = useLoaderData<typeof loader>();

  return (
    <div className="cm-home overflow-x-hidden">
      <HomepageSectionNav />
      <Suspense
        fallback={
          <>
            <header id="home-hero" className="cm-home-header cm-home-scroll-target">
              <CampManiaHero packages={[]} />
              <div
                id="home-quicknav"
                className="cm-home-width cm-home-top-bar cm-home-scroll-target"
              >
                <HomeQuickNav />
              </div>
            </header>
            <FeaturedSectionSkeleton />
            <FeaturedPackagesSectionSkeleton />
          </>
        }
      >
        <Await resolve={featuredSections}>
          {({packages, gear, gearCatalog}) => (
            <>
              <header id="home-hero" className="cm-home-header cm-home-scroll-target">
                <CampManiaHero packages={packages} />
                <div
                  id="home-quicknav"
                  className="cm-home-width cm-home-top-bar cm-home-scroll-target"
                >
                  <HomeQuickNav />
                </div>
              </header>

              <HomeCategories />

              <FeaturedGearSection
                sectionId="home-gear"
                id="home-gear-heading"
                items={gear}
              />
              <FeaturedPackagesSection
                sectionId="home-packages"
                id="home-packages-heading"
                packages={packages}
                gearCatalog={gearCatalog}
              />
            </>
          )}
        </Await>
      </Suspense>

      <div className="cm-home-width cm-home-bottom">
        <HomeShopTiles />
        <HomePerksStrip />
        <HomeHowItWorksCompact />
      </div>
    </div>
  );
}

function FeaturedPackagesSection({
  sectionId,
  id,
  packages,
  gearCatalog,
}: {
  sectionId: string;
  id: string;
  packages: ShopifyPackageItem[];
  gearCatalog: ShopifyGearItem[];
}) {
  const {translations: tr, locale} = useLocale();
  const durationOptions = DURATION_FILTERS.map((option) => ({
    value: option.value,
    label: locale === 'ka' ? option.labelKa : option.labelEn,
  }));

  return (
    <section
      id={sectionId}
      className="cm-home-products cm-home-scroll-target"
      aria-labelledby={id}
    >
      <div className="cm-home-width">
        <FeaturedSectionHead
          id={id}
          copy={tr.featured.packages}
          viewAllHref="/packages"
        />

        {packages.length ? (
          <div className="cm-catalog-grid cm-catalog-grid--packages">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                gear={gearCatalog}
                locale={locale}
                durationOptions={durationOptions}
                totalLabel={tr.booking.total}
                itemsCountLabel={tr.packages.itemsCount}
                savingsLabel={locale === 'ka' ? 'ღირ.' : 'Was'}
                includedLabel={tr.packages.included}
              />
            ))}
          </div>
        ) : (
          <div className="cm-home-products-empty">
            <p>{tr.featured.packages.empty}</p>
            <Link to="/packages" className="tr-btn-primary mt-4 inline-flex">
              {tr.hero.ctaPackages}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedGearSection({
  sectionId,
  id,
  items,
}: {
  sectionId: string;
  id: string;
  items: HomepageFeaturedItem[];
}) {
  const {translations: tr, locale} = useLocale();
  const perDay = locale === 'ka' ? '/ დღე' : '/ day';

  return (
    <section
      id={sectionId}
      className="cm-home-products cm-home-scroll-target"
      aria-labelledby={id}
    >
      <div className="cm-home-width">
        <FeaturedSectionHead
          id={id}
          copy={tr.featured.gear}
          viewAllHref="/individual-gear"
        />

        {items.length ? (
          <div className="cm-catalog-grid">
            {items.map((item, index) => (
              <CatalogProductCard
                key={item.id}
                to={item.url}
                title={item.title}
                imageUrl={item.imageUrl}
                imageUrls={item.imageUrls}
                imageAlt={item.imageAlt ?? item.title}
                loading={index < 4 ? 'eager' : 'lazy'}
                variant="product"
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
            <p>{tr.featured.gear.empty}</p>
            <Link to="/individual-gear" className="tr-btn-primary mt-4 inline-flex">
              {tr.hero.ctaGear}
            </Link>
          </div>
        )}
      </div>
    </section>
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

function FeaturedPackagesSectionSkeleton() {
  return (
    <section className="cm-home-products">
      <div className="cm-home-width">
        <div className="cm-catalog-grid cm-catalog-grid--packages">
          {Array.from({length: 2}).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl bg-stone/60 sm:h-44"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedSectionHead({
  id,
  copy,
  viewAllHref,
}: {
  id: string;
  copy: {
    eyebrow: string;
    title: string;
    subtitle: string;
    viewAll: string;
  };
  viewAllHref: string;
}) {
  return (
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
  );
}
