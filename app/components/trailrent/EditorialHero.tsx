import {Await} from 'react-router';
import {Suspense} from 'react';
import {motion} from 'framer-motion';
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
          {(slides) => <HeroBillboardColumn slides={slides} />}
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

function HeroBillboardColumn({slides}: {slides: HomepagePromoSlide[]}) {
  const {locale} = useLocale();
  const resolved = slides.length ? slides : getFallbackHomepagePromoSlides(locale);
  const slide = resolved[0];
  if (!slide) return <HeroBillboardSkeleton />;

  return (
    <motion.aside
      className="cm-hero-billboard"
      aria-label={slide.title}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1]}}
    >
      <div className="cm-hero-billboard__frame">
        <img
          src={slide.imageUrl}
          alt={slide.imageAlt ?? slide.title}
          className="cm-hero-billboard__image"
          loading="eager"
        />

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
