import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {useLocale} from '~/providers/LocaleProvider';
import {CatalogProductCard} from '~/components/trailrent/CatalogProductCard';
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
import {HomePromoCarousel} from '~/components/trailrent/HomePromoCarousel';
import {
  HOMEPAGE_PROMO_SLIDES_QUERY,
  parseHomepagePromoSlides,
} from '~/lib/trailrent/homepagePromo';
import {
  loadHomepageFeaturedSections,
  type HomepageFeaturedItem,
  type ShopifyGearItem,
  type ShopifyPackageItem,
} from '~/lib/trailrent/shopify-catalog';
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
  sections: Promise<{
    packages: ShopifyPackageItem[];
    gear: HomepageFeaturedItem[];
    gearCatalog: ShopifyGearItem[];
  }>;
}) {
  const {translations: tr, locale} = useLocale();
  const perDay = locale === 'ka' ? '/ დღე' : '/ day';
  const durationOptions = DURATION_FILTERS.map((option) => ({
    value: option.value,
    label: locale === 'ka' ? option.labelKa : option.labelEn,
  }));

  return (
    <Suspense
      fallback={
        <>
          <FeaturedPackagesSectionSkeleton />
          <FeaturedSectionSkeleton />
        </>
      }
    >
      <Await resolve={sections}>
        {({packages, gear, gearCatalog}) => (
          <>
            <FeaturedPackagesSection
              id="home-packages-heading"
              copy={tr.featured.packages}
              viewAllHref="/packages"
              packages={packages}
              gearCatalog={gearCatalog}
              durationOptions={durationOptions}
              locale={locale}
              totalLabel={tr.booking.total}
              itemsCountLabel={tr.packages.itemsCount}
              savingsLabel={locale === 'ka' ? 'ღირ.' : 'Was'}
              includedLabel={tr.packages.included}
              emptyCta={{label: tr.hero.ctaPackages, href: '/packages'}}
            />
            <FeaturedGearSection
              id="home-gear-heading"
              copy={tr.featured.gear}
              viewAllHref="/individual-gear"
              items={gear}
              perDay={perDay}
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

function FeaturedPackagesSection({
  id,
  copy,
  viewAllHref,
  packages,
  gearCatalog,
  durationOptions,
  locale,
  totalLabel,
  itemsCountLabel,
  savingsLabel,
  includedLabel,
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
  packages: ShopifyPackageItem[];
  gearCatalog: ShopifyGearItem[];
  durationOptions: Array<{value: string; label: string}>;
  locale: 'ka' | 'en';
  totalLabel: string;
  itemsCountLabel: string;
  savingsLabel: string;
  includedLabel: string;
  emptyCta: {label: string; href: string};
}) {
  return (
    <section className="cm-home-products" aria-labelledby={id}>
      <div className="cm-home-width">
        <FeaturedSectionHead id={id} copy={copy} viewAllHref={viewAllHref} />

        {packages.length ? (
          <div className="cm-catalog-grid cm-catalog-grid--packages">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                gear={gearCatalog}
                locale={locale}
                durationOptions={durationOptions}
                totalLabel={totalLabel}
                itemsCountLabel={itemsCountLabel}
                savingsLabel={savingsLabel}
                includedLabel={includedLabel}
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

function FeaturedGearSection({
  id,
  copy,
  viewAllHref,
  items,
  perDay,
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
  emptyCta: {label: string; href: string};
}) {
  return (
    <section className="cm-home-products" aria-labelledby={id}>
      <div className="cm-home-width">
        <FeaturedSectionHead id={id} copy={copy} viewAllHref={viewAllHref} />

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
