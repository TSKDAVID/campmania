import {lazy, Suspense, useEffect, useRef, useState} from 'react';
import type {ShopifyPackageItem} from '~/lib/trailrent/shopify-catalog';
import {useIsDesktop} from '~/hooks/useMediaQuery';
import {HeroMobileArt} from '~/components/trailrent/HeroMobileArt';

const HeroFloatingCanvas = lazy(
  () =>
    import('~/components/trailrent/HeroFloatingCanvas').then((m) => ({
      default: m.HeroFloatingCanvas,
    })),
);

type CampManiaHeroProps = {
  packages?: ShopifyPackageItem[];
};

export function CampManiaHero({packages = []}: CampManiaHeroProps) {
  const isDesktop = useIsDesktop();
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const node = heroRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)),
      );
      setScrollProgress(progress);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const packageImageUrls = packages
    .slice(0, 4)
    .map((pkg) => pkg.imageUrls?.[0] ?? pkg.imageUrl)
    .filter((url): url is string => Boolean(url));

  const scrollToPackages = () => {
    document.getElementById('home-packages')?.scrollIntoView({behavior: 'smooth'});
  };

  const showThree = mounted && isDesktop;

  return (
    <section ref={heroRef} className="cm-hero" aria-labelledby="cm-hero-heading">
      <div className="cm-hero__grid">
        <div className="cm-hero__copy">
          <p className="cm-hero__eyebrow">CampMania · Tbilisi</p>
          <h1 id="cm-hero-heading" className="cm-hero__title">
            აღჭურვილობა შენი თავგადასავლისთვის.
          </h1>
          <p className="cm-hero__subtitle">
            პრემიუმ სალაშქრო ნაკრებების გაქირავება თბილისში.
          </p>
          <button type="button" className="cm-hero__cta" onClick={scrollToPackages}>
            აირჩიე ნაკრები
          </button>
        </div>

        <div className="cm-hero__visual">
          {showThree ? (
            <Suspense
              fallback={<div className="cm-hero__visual cm-hero__visual--loading" aria-hidden />}
            >
              <HeroFloatingCanvas
                packageImageUrls={packageImageUrls}
                scrollProgress={scrollProgress}
              />
            </Suspense>
          ) : (
            <HeroMobileArt packageImageUrls={packageImageUrls} />
          )}
        </div>
      </div>
    </section>
  );
}
