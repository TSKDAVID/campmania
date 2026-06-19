import {Link} from 'react-router';
import {useCallback, useEffect, useId, useRef, useState} from 'react';
import {IconArrowRight} from '~/components/trailrent/Icons';
import {useLocale} from '~/providers/LocaleProvider';
import {
  getFallbackHomepagePromoSlides,
  type HomepagePromoSlide,
} from '~/lib/trailrent/homepagePromo';

const AUTO_ADVANCE_MS = 6500;
const SWIPE_THRESHOLD_PX = 48;

type HomePromoCarouselProps = {
  slides?: HomepagePromoSlide[] | null;
};

export function HomePromoCarousel({slides}: HomePromoCarouselProps) {
  const {locale, translations: tr} = useLocale();
  const resolvedSlides =
    slides && slides.length > 0 ? slides : getFallbackHomepagePromoSlides(locale);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const carouselId = useId();
  const slideCount = resolvedSlides.length;
  const hasMultipleSlides = slideCount > 1;

  const goTo = useCallback(
    (index: number) => {
      if (!slideCount) return;
      const next = (index + slideCount) % slideCount;
      setActiveIndex(next);
    },
    [slideCount],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    setActiveIndex(0);
  }, [locale, slides]);

  useEffect(() => {
    if (!hasMultipleSlides || isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [hasMultipleSlides, isPaused, slideCount]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current == null) return;
    const delta = event.changedTouches[0]?.clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta == null || Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0) goNext();
    else goPrev();
  };

  return (
    <section
      className="cm-home-promo-carousel"
      aria-roledescription="carousel"
      aria-label={tr.home.promoCarouselLabel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="cm-home-promo-viewport">
        {resolvedSlides.map((slide, index) => {
          const isActive = index === activeIndex;
          const titleId = `${carouselId}-slide-${index}-title`;

          return (
            <Link
              key={slide.id}
              to={slide.linkUrl}
              className={`cm-home-promo group cm-home-promo-slide${
                isActive ? ' is-active' : ''
              }`}
              aria-hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
              aria-labelledby={isActive ? titleId : undefined}
            >
              <img
                src={slide.imageUrl}
                alt={slide.imageAlt ?? ''}
                className="cm-home-promo-image"
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className="cm-home-promo-overlay" aria-hidden />
              <div className="cm-home-promo-content">
                {slide.badge ? (
                  <p className="cm-home-promo-badge">{slide.badge}</p>
                ) : null}
                {isActive ? (
                  <h1 id={titleId} className="cm-home-promo-title">
                    {slide.title}
                  </h1>
                ) : (
                  <p className="cm-home-promo-title">{slide.title}</p>
                )}
                {slide.subtitle ? (
                  <p className="cm-home-promo-subtitle">{slide.subtitle}</p>
                ) : null}
                <span className="cm-home-promo-cta">
                  {slide.ctaLabel}
                  <IconArrowRight size={16} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMultipleSlides ? (
        <>
          <button
            type="button"
            className="cm-home-promo-nav cm-home-promo-nav--prev"
            onClick={(event) => {
              event.preventDefault();
              goPrev();
            }}
            aria-label={tr.home.promoPrev}
          >
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            className="cm-home-promo-nav cm-home-promo-nav--next"
            onClick={(event) => {
              event.preventDefault();
              goNext();
            }}
            aria-label={tr.home.promoNext}
          >
            <span aria-hidden>›</span>
          </button>
          <div className="cm-home-promo-dots" role="tablist" aria-label={tr.home.promoDots}>
            {resolvedSlides.map((slide, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  className={`cm-home-promo-dot${selected ? ' is-active' : ''}`}
                  aria-selected={selected}
                  aria-label={`${tr.home.promoGoTo} ${index + 1}`}
                  onClick={(event) => {
                    event.preventDefault();
                    goTo(index);
                  }}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}
