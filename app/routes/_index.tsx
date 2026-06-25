import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {getLocaleFromRequest, useLocale} from '~/providers/LocaleProvider';
import {CatalogProductCard} from '~/components/trailrent/CatalogProductCard';
import {PriceWithCompare} from '~/components/trailrent/PriceWithCompare';
import {EditorialHero} from '~/components/trailrent/EditorialHero';
import {BrandTicker} from '~/components/trailrent/BrandTicker';
import {CuratedPackagesShowcase} from '~/components/trailrent/CuratedPackagesShowcase';
import {CategoryBentoMatrix} from '~/components/trailrent/CategoryBentoMatrix';
import {
  loadHomepageFeaturedSections,
  type HomepageFeaturedItem,
} from '~/lib/trailrent/shopify-catalog';
import {
  HOMEPAGE_PROMO_SLIDES_QUERY,
  parseHomepagePromoSlides,
} from '~/lib/trailrent/homepagePromo';

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

  return {featuredSections, promoSlides};
}

export const meta: Route.MetaFunction = () => [
  {title: 'Camp Mania | Premium Gear Rental — Tbilisi'},
];

export default function Homepage() {
  const {featuredSections, promoSlides} = useLoaderData<typeof loader>();
  const {locale} = useLocale();
  const isKa = locale === 'ka';

  return (
    <div className="cm-home overflow-x-hidden">
      <EditorialHero promoSlides={promoSlides} />

      <BrandTicker />

      <section className="cm-home-proposition">
        <div className="cm-home-proposition__inner">
          <p className="cm-home-proposition__eyebrow">
            {isKa ? 'რატომ Campmania' : 'Why Campmania'}
          </p>
          <h2 className="cm-home-proposition__title">
            {isKa
              ? 'სანდო აღჭურვილობა. სწრაფი აღება. მშვიდი მზადება მარშრუტისთვის.'
              : 'Reliable gear. Quick pickup. Calm trail preparation.'}
          </h2>
          <div className="cm-home-proposition__points">
            <p>
              {isKa
                ? 'ყველა ნივთი ინსპექტირდება გაცემამდე.'
                : 'Every item is inspected before handoff.'}
            </p>
            <p>
              {isKa
                ? 'ნაკრებები მორგებულია რეალურ კავკასიურ ბილიკებზე.'
                : 'Kits are curated for real Caucasus routes.'}
            </p>
            <p>
              {isKa
                ? 'დაჯავშნე, აიღე მეტროს ჰაბში და წადი.'
                : 'Book, pick up at metro, and head out.'}
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<HomepageDeferredSkeleton />}>
        <Await resolve={featuredSections}>
          {({packages, gear}) => (
            <>
              <FeaturedGearStrip items={gear} />

              <CuratedPackagesShowcase packages={packages} />

              <CategoryBentoMatrix />
            </>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

function FeaturedGearStrip({items}: {items: HomepageFeaturedItem[]}) {
  const {locale} = useLocale();
  const isKa = locale === 'ka';
  const perDay = isKa ? '/ დღე' : '/ day';

  return (
    <section
      id="home-gear"
      className="cm-gear-strip cm-home-scroll-target"
      aria-labelledby="cm-gear-strip-heading"
    >
      <header className="cm-gear-strip__head">
        <p className="cm-gear-strip__eyebrow">
          {isKa ? '02 — ცალკეული აღჭურვილობა' : '02 — Individual gear'}
        </p>
        <h2 id="cm-gear-strip-heading" className="cm-gear-strip__title">
          {isKa
            ? 'შეარჩიე კონკრეტული ნივთები შენი მარშრუტისთვის.'
            : 'Select individual pieces for your exact route.'}
        </h2>
        <Link to="/individual-gear" className="cm-gear-strip__link">
          <span>{isKa ? 'სრული კატალოგი' : 'Full catalog'}</span>
          <span aria-hidden>→</span>
        </Link>
      </header>

      {items.length ? (
        <div className="cm-gear-strip__grid">
          {items.map((item, index) => (
            <CatalogProductCard
              key={item.id}
              to={item.url}
              title={item.title}
              imageUrl={item.imageUrl}
              imageUrls={item.imageUrls}
              imageAlt={item.imageAlt ?? item.title}
              loading={index < 2 ? 'eager' : 'lazy'}
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
        <div className="cm-gear-strip__empty">
          <p>
            {isKa
              ? 'აღჭურვილობა მალე გამოჩნდება.'
              : 'Gear will be available shortly.'}
          </p>
          <Link to="/individual-gear" className="cm-gear-strip__empty-link">
            {isKa ? 'ნახე კატალოგი' : 'Browse catalog'} →
          </Link>
        </div>
      )}
    </section>
  );
}

function HomepageDeferredSkeleton() {
  return (
    <>
      <section className="cm-showcase cm-showcase--skeleton" aria-hidden>
        <div className="cm-showcase__head">
          <div className="cm-skeleton cm-skeleton--eyebrow" />
          <div className="cm-skeleton cm-skeleton--title" />
        </div>
        <div className="cm-showcase__track">
          <ol className="cm-showcase__rail">
            {['one', 'two', 'three'].map((slot) => (
              <li key={slot} className="cm-showcase__cell">
                <div className="cm-showcase-card cm-showcase-card--skeleton">
                  <div className="cm-showcase-card__media" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cm-bento cm-bento--skeleton" aria-hidden>
        <div className="cm-bento__grid">
          {['a', 'b', 'c', 'd', 'e', 'f'].map((slot) => (
            <div key={slot} className="cm-bento__cell cm-bento__cell--skeleton" />
          ))}
        </div>
      </section>
    </>
  );
}
