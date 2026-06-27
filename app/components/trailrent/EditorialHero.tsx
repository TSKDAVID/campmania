import {useCallback, useEffect, useState, Suspense} from 'react';
import {Await, Link, useRouteLoaderData} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {
  getFallbackHomepagePromoSlides,
  type HomepagePromoSlide,
} from '~/lib/trailrent/homepagePromo';
import {resolveStorefrontPath} from '~/lib/storefront-url';
import type {RootLoader} from '~/root';

type EditorialHeroProps = {
  promoSlides: Promise<HomepagePromoSlide[]>;
};

const HEADLINE_KA = 'აღჭურვილობა შენი თავგადასავლისთვის.';
const MISSION_KA =
  'პრემიუმ სალაშქრო და სამთო ნაკრებების გაქირავება თბილისში — შერჩეული აღჭურვილობა, მკაცრი ხარისხის კონტროლი და უპრობლემო ლოგისტიკა.';
const EYEBROW_KA = 'Camp Mania · თბილისი';
const SCROLL_LABEL_KA = 'გადახედე ნაკრებებს';
const AUTO_ADVANCE_MS = 3000;

export function EditorialHero({promoSlides}: EditorialHeroProps) {
  const {locale} = useLocale();

  return (
    <section
      className="cm-hero-editorial"
      aria-label={locale === 'ka' ? 'მთავარი ბანერი' : 'Homepage hero'}
    >
      <HeroCopyColumn />
      <Suspense fallback={<HeroBillboardSkeleton />}>
        <Await resolve={promoSlides}>
          {(slides) => <HeroBillboardCarousel slides={slides} />}
        </Await>
      </Suspense>
    </section>
  );
}

function HeroCopyColumn() {
  const scrollToPackages = () => {
    document
      .getElementById('home-packages')
      ?.scrollIntoView({behavior: 'auto', block: 'start'});
  };

  return (
    <div className="cm-hero-editorial__copy">
      <p className="cm-hero-editorial__eyebrow">
        {EYEBROW_KA}
      </p>

      <h1 id="cm-hero-headline" className="cm-hero-editorial__headline">
        {HEADLINE_KA}
      </h1>

      <p className="cm-hero-editorial__mission">
        {MISSION_KA}
      </p>

      <div className="cm-hero-editorial__actions">
        <button
          type="button"
          className="cm-hero-editorial__cta"
          onClick={scrollToPackages}
        >
          აირჩიე ნაკრები
          <span aria-hidden className="cm-hero-editorial__cta-arrow">
            →
          </span>
        </button>
        <a className="cm-hero-editorial__link" href="/individual-gear">
          ინდივიდუალური აღჭურვილობა
        </a>
      </div>

      <div className="cm-hero-editorial__meta" aria-hidden>
        <span className="cm-hero-editorial__meta-line" />
        <span className="cm-hero-editorial__meta-label">
          {SCROLL_LABEL_KA}
        </span>
      </div>
    </div>
  );
}

function HeroBillboardCarousel({slides}: {slides: HomepagePromoSlide[]}) {
  const {locale} = useLocale();
  const resolved = slides.length ? slides : getFallbackHomepagePromoSlides(locale);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideCount = resolved.length;
  const hasMultiple = slideCount > 1;

  const goTo = useCallback(
    (index: number) => {
      if (!slideCount) return;
      const next = ((index % slideCount) + slideCount) % slideCount;
      setActiveIndex(next);
    },
    [slideCount],
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    setActiveIndex(0);
  }, [locale, slides]);

  useEffect(() => {
    if (!hasMultiple || isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [hasMultiple, isPaused, slideCount]);

  if (!resolved.length) return <HeroBillboardSkeleton />;

  const carouselLabel =
    locale === 'ka' ? 'მთავარი ბანერი' : 'Homepage banner carousel';

  return (
    <aside
      className="cm-hero-billboard"
      aria-label={carouselLabel}
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="cm-hero-billboard__stage">
        <div
          className="cm-hero-billboard__track"
          style={{transform: `translate3d(-${activeIndex * 100}%, 0, 0)`}}
          aria-live="polite"
        >
          {resolved.map((entry, index) => {
            const isActive = index === activeIndex;

            return (
              <article
                key={entry.id ?? `${entry.title}-${index}`}
                className="cm-hero-billboard__slide"
                aria-hidden={!isActive}
              >
                <HeroBillboardLink
                  href={entry.linkUrl}
                  isActive={isActive}
                  className="cm-hero-billboard__frame cm-hero-billboard__frame-link"
                  ariaLabel={entry.title}
                >
                  <img
                    src={entry.imageUrl}
                    alt={entry.imageAlt ?? entry.title}
                    className="cm-hero-billboard__image"
                    loading={index <= 1 ? 'eager' : 'lazy'}
                  />

                  {entry.badge ? (
                    <span className="cm-hero-billboard__corner-badge">
                      {entry.badge}
                    </span>
                  ) : null}
                </HeroBillboardLink>

                <div className="cm-hero-billboard__card">
                  <p className="cm-hero-billboard__eyebrow">
                    {locale === 'ka' ? 'მიმდინარე ანონსი' : 'Now featured'}
                  </p>
                  <h2 className="cm-hero-billboard__title">{entry.title}</h2>
                  {entry.subtitle ? (
                    <p className="cm-hero-billboard__subtitle">{entry.subtitle}</p>
                  ) : null}
                  <HeroBillboardCtaLink
                    href={entry.linkUrl}
                    isActive={isActive}
                    label={entry.ctaLabel}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {hasMultiple ? (
        <div className="cm-hero-billboard__controls">
          <button
            type="button"
            className="cm-hero-billboard__nav-btn"
            onClick={goPrev}
            aria-label={locale === 'ka' ? 'წინა სлайд' : 'Previous slide'}
          >
            ←
          </button>

          <div className="cm-hero-billboard__dots" role="tablist">
            {resolved.map((entry, index) => (
              <button
                key={entry.id ?? `${entry.title}-${index}`}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={
                  locale === 'ka'
                    ? `სлайд ${index + 1} / ${resolved.length}`
                    : `Slide ${index + 1} of ${resolved.length}`
                }
                className={`cm-hero-billboard__dot${
                  index === activeIndex ? ' cm-hero-billboard__dot--active' : ''
                }`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>

          <button
            type="button"
            className="cm-hero-billboard__nav-btn"
            onClick={goNext}
            aria-label={locale === 'ka' ? 'შემდეგი სлайд' : 'Next slide'}
          >
            →
          </button>
        </div>
      ) : null}
    </aside>
  );
}

function HeroBillboardLink({
  href,
  isActive,
  className,
  ariaLabel,
  children,
}: {
  href: string;
  isActive: boolean;
  className: string;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const {to, external} = resolveStorefrontPath(href, {
    storeDomain: rootData?.publicStoreDomain,
    primaryDomainUrl: rootData?.header?.shop?.primaryDomain?.url,
    requestHost:
      typeof window !== 'undefined' ? window.location.hostname : undefined,
  });
  const sharedProps = {
    className,
    'aria-label': ariaLabel,
    tabIndex: isActive ? 0 : -1,
  };

  if (external) {
    return (
      <a href={to} {...sharedProps}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} prefetch={isActive ? 'intent' : 'none'} {...sharedProps}>
      {children}
    </Link>
  );
}

function HeroBillboardCtaLink({
  href,
  isActive,
  label,
}: {
  href: string;
  isActive: boolean;
  label: string;
}) {
  return (
    <HeroBillboardLink
      href={href}
      isActive={isActive}
      className="cm-hero-billboard__cta"
      ariaLabel={label}
    >
      {label}
      <span aria-hidden>→</span>
    </HeroBillboardLink>
  );
}

function HeroBillboardSkeleton() {
  return (
    <aside className="cm-hero-billboard cm-hero-billboard--skeleton" aria-hidden>
      <div className="cm-hero-billboard__frame" />
    </aside>
  );
}
