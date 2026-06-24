import {useCallback, useState, Suspense} from 'react';
import {Await} from 'react-router';
import {motion, AnimatePresence} from 'framer-motion';
import {useLocale} from '~/providers/LocaleProvider';
import {
  getFallbackHomepagePromoSlides,
  type HomepagePromoSlide,
} from '~/lib/trailrent/homepagePromo';

type EditorialHeroProps = {
  promoSlides: Promise<HomepagePromoSlide[]>;
};

const HEADLINE_KA = 'აღჭურვილობა შენი თავგადასავლისთვის.';
const MISSION_KA =
  'პრემიუმ სალაშქრო და სამთო ნაკრებების გაქირავება თბილისში — შერჩეული აღჭურვილობა, მკაცრი ხარისხის კონტროლი და უპრობლემო ლოგისტიკა.';
const EYEBROW_KA = 'Camp Mania · თბილისი';
const SCROLL_LABEL_KA = 'გადახედე ნაკრებებს';

export function EditorialHero({promoSlides}: EditorialHeroProps) {
  return (
    <section className="cm-hero-editorial" aria-labelledby="cm-hero-headline">
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
      ?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  return (
    <div className="cm-hero-editorial__copy">
      <motion.p
        className="cm-hero-editorial__eyebrow"
        initial={{opacity: 0, y: 12}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1]}}
      >
        {EYEBROW_KA}
      </motion.p>

      <motion.h1
        id="cm-hero-headline"
        className="cm-hero-editorial__headline"
        initial={{opacity: 0, y: 18}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1]}}
      >
        {HEADLINE_KA}
      </motion.h1>

      <motion.p
        className="cm-hero-editorial__mission"
        initial={{opacity: 0, y: 16}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1]}}
      >
        {MISSION_KA}
      </motion.p>

      <motion.div
        className="cm-hero-editorial__actions"
        initial={{opacity: 0, y: 16}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1]}}
      >
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
      </motion.div>

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

  const goTo = useCallback(
    (index: number) => {
      if (!resolved.length) return;
      const next = ((index % resolved.length) + resolved.length) % resolved.length;
      setActiveIndex(next);
    },
    [resolved.length],
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  if (!resolved.length) return <HeroBillboardSkeleton />;

  const slide = resolved[activeIndex] ?? resolved[0];
  if (!slide) return <HeroBillboardSkeleton />;

  const hasMultiple = resolved.length > 1;
  const carouselLabel =
    locale === 'ka' ? 'მთავარი ბანერი' : 'Homepage banner carousel';

  return (
    <motion.aside
      className="cm-hero-billboard"
      aria-label={carouselLabel}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1]}}
    >
      <div className="cm-hero-billboard__frame">
        <AnimatePresence mode="wait">
          <motion.img
            key={slide.id ?? slide.title}
            src={slide.imageUrl}
            alt={slide.imageAlt ?? slide.title}
            className="cm-hero-billboard__image"
            loading="eager"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.45, ease: [0.22, 1, 0.36, 1]}}
          />
        </AnimatePresence>

        {slide.badge ? (
          <span className="cm-hero-billboard__corner-badge">{slide.badge}</span>
        ) : null}

        <div className="cm-hero-billboard__card">
          <p className="cm-hero-billboard__eyebrow">
            {locale === 'ka' ? 'მიმდინარე ანონსი' : 'Now featured'}
          </p>
          <h2 className="cm-hero-billboard__title">{slide.title}</h2>
          {slide.subtitle ? (
            <p className="cm-hero-billboard__subtitle">{slide.subtitle}</p>
          ) : null}
          <a className="cm-hero-billboard__cta" href={slide.linkUrl}>
            {slide.ctaLabel}
            <span aria-hidden>→</span>
          </a>
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
      </div>
    </motion.aside>
  );
}

function HeroBillboardSkeleton() {
  return (
    <aside className="cm-hero-billboard cm-hero-billboard--skeleton" aria-hidden>
      <div className="cm-hero-billboard__frame" />
    </aside>
  );
}
