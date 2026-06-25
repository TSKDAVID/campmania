import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense, useRef, useCallback} from 'react';
import {useLocale} from '~/providers/LocaleProvider';
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
import {getLocaleFromRequest} from '~/providers/LocaleProvider';

export async function loader(args: Route.LoaderArgs) {
  const locale = getLocaleFromRequest(args.request);
  const featuredSections = loadHomepageFeaturedSections(
    args.context.storefront,
    locale,
    {packageLimit: 6, gearLimit: 10},
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

  return (
    <div className="cm-home overflow-x-hidden">
      <EditorialHero promoSlides={promoSlides} />

      <BrandTicker />

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

  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({dragging: false, startX: 0, scrollLeft: 0});

  const scrollBy = useCallback((dir: 'prev' | 'next') => {
    const el = trackRef.current;
    if (!el) return;
    const cardEl = el.querySelector<HTMLElement>('.cm-kit-card');
    const step = cardEl ? cardEl.offsetWidth * 3 : el.clientWidth * 0.75;
    el.scrollBy({left: dir === 'next' ? step : -step, behavior: 'smooth'});
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    dragState.current = {dragging: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft};
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;
    const el = trackRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.4;
    el.scrollLeft = dragState.current.scrollLeft - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    dragState.current.dragging = false;
    const el = trackRef.current;
    if (el) { el.style.cursor = 'grab'; el.style.userSelect = ''; }
  }, []);

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
            ? 'შეარჩიე ცალკეული აღჭურვილობა.'
            : 'Hand-picked individual gear.'}
        </h2>
        <Link to="/individual-gear" className="cm-gear-strip__link">
          <span>{isKa ? 'სრული კატალოგი' : 'Full catalog'}</span>
          <span aria-hidden>→</span>
        </Link>
      </header>

      {items.length ? (
        <div className="cm-gear-strip__carousel">
          {/* Prev / Next buttons */}
          <button
            type="button"
            className="cm-gear-strip__nav cm-gear-strip__nav--prev"
            onClick={() => scrollBy('prev')}
            aria-label={isKa ? 'წინა' : 'Previous'}
          >←</button>
          <button
            type="button"
            className="cm-gear-strip__nav cm-gear-strip__nav--next"
            onClick={() => scrollBy('next')}
            aria-label={isKa ? 'შემდეგი' : 'Next'}
          >→</button>

          {/* Drag-to-scroll track */}
          <div
            className="cm-gear-strip__grid"
            ref={trackRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
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
            <Link
              to="/individual-gear"
              className="cm-gear-strip__end-card"
              aria-label={isKa ? 'სრული კატალოგი' : 'View all gear'}
            >
              <span className="cm-gear-strip__end-label">
                {isKa ? 'სრული\nკატალოგი' : 'View\nall gear'}
              </span>
              <span className="cm-gear-strip__end-arrow" aria-hidden>→</span>
            </Link>
          </div>
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
            {Array.from({length: 3}).map((_, index) => (
              <li key={index} className="cm-showcase__cell">
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
          {Array.from({length: 6}).map((_, index) => (
            <div key={index} className="cm-bento__cell cm-bento__cell--skeleton" />
          ))}
        </div>
      </section>
    </>
  );
}
