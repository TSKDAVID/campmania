import {Link} from 'react-router';
import {useCallback, useRef} from 'react';
import type {ShopifyPackageItem} from '~/lib/trailrent/shopify-catalog';
import {useLocale} from '~/providers/LocaleProvider';

type CuratedPackagesShowcaseProps = {
  packages: ShopifyPackageItem[];
};

const HOVER_BADGE_KA = 'ნაკრების ნახვა';

export function CuratedPackagesShowcase({packages}: CuratedPackagesShowcaseProps) {
  const {locale} = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const isKa = locale === 'ka';
  const eyebrow = isKa ? '03 — შერჩეული ნაკრებები' : '03 — Curated packages';
  const heading = isKa
    ? 'სალაშქრო კოლექცია, რომელიც პატივს სცემს ბუნებას.'
    : 'Trail kits engineered for the Caucasus.';
  const subhead = isKa
    ? 'გადააციალე ჰორიზონტალურად ან გამოიყენე ისრები.'
    : 'Swipe sideways or use the arrows.';
  const scrollHint = isKa ? 'გადააციალე' : 'Swipe';

  const scrollTrack = useCallback((direction: 'prev' | 'next') => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.cm-showcase__cell');
    const step = card ? card.offsetWidth : track.clientWidth * 0.72;
    track.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    });
  }, []);

  if (!packages.length) {
    return (
      <section
        id="home-packages"
        className="cm-showcase cm-home-scroll-target"
        aria-labelledby="cm-showcase-heading"
      >
        <header className="cm-showcase__head">
          <p className="cm-showcase__eyebrow">{eyebrow}</p>
          <h2 id="cm-showcase-heading" className="cm-showcase__title">
            {heading}
          </h2>
        </header>
        <div className="cm-showcase__empty">
          <p>
            {isKa
              ? 'ნაკრებები მალე გამოჩნდება.'
              : 'Packages will be available shortly.'}
          </p>
          <Link to="/packages" className="cm-showcase__empty-link">
            {isKa ? 'ნახე ყველა' : 'Browse all'} →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      id="home-packages"
      className="cm-showcase cm-home-scroll-target"
      aria-labelledby="cm-showcase-heading"
    >
      <header className="cm-showcase__head">
        <div className="cm-showcase__head-text">
          <p className="cm-showcase__eyebrow">{eyebrow}</p>
          <h2 id="cm-showcase-heading" className="cm-showcase__title">
            {heading}
          </h2>
          <p className="cm-showcase__subhead">{subhead}</p>
        </div>
        <Link to="/packages" className="cm-showcase__index-link">
          <span>{isKa ? 'ყველა ნაკრები' : 'View all packages'}</span>
          <span aria-hidden>→</span>
        </Link>
      </header>

      <div className="cm-showcase__carousel">
        <div
          className="cm-showcase__track"
          ref={trackRef}
          role="region"
          aria-label={isKa ? 'ნაკრებების კოლექცია' : 'Package collection'}
        >
          <ol className="cm-showcase__rail">
            {packages.map((pkg, index) => (
              <li key={pkg.id} className="cm-showcase__cell">
                <ShowcaseCard
                  pkg={pkg}
                  index={index}
                  hoverLabel={HOVER_BADGE_KA}
                  isKa={isKa}
                />
              </li>
            ))}
            <li className="cm-showcase__cell cm-showcase__cell--end" aria-hidden>
              <Link to="/packages" className="cm-showcase__end-card">
                <span className="cm-showcase__end-label">
                  {isKa ? 'ნახე მთლიანი არქივი' : 'View full archive'}
                </span>
                <span className="cm-showcase__end-arrow" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          </ol>
        </div>

        {packages.length > 1 ? (
          <div className="cm-showcase__controls">
            <button
              type="button"
              className="cm-showcase__nav-btn"
              onClick={() => scrollTrack('prev')}
              aria-label={isKa ? 'წინა ნაკრები' : 'Previous package'}
            >
              ←
            </button>
            <span className="cm-showcase__scroll-hint">{scrollHint}</span>
            <button
              type="button"
              className="cm-showcase__nav-btn"
              onClick={() => scrollTrack('next')}
              aria-label={isKa ? 'შემდეგი ნაკრები' : 'Next package'}
            >
              →
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

type ShowcaseCardProps = {
  pkg: ShopifyPackageItem;
  index: number;
  hoverLabel: string;
  isKa: boolean;
};

function ShowcaseCard({pkg, index, hoverLabel, isKa}: ShowcaseCardProps) {
  const ordinal = String(index + 1).padStart(2, '0');
  const href = pkg.productHandle ? `/products/${pkg.productHandle}` : '/packages';

  return (
    <Link to={href} className="cm-showcase-card" prefetch="intent">
      <figure className="cm-showcase-card__media">
        {pkg.imageUrl ? (
          <img
            src={pkg.imageUrl}
            alt={pkg.imageAlt ?? pkg.title}
            className="cm-showcase-card__image"
            loading={index < 2 ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="cm-showcase-card__image cm-showcase-card__image--blank" />
        )}

        <span className="cm-showcase-card__hover-badge" aria-hidden>
          {hoverLabel}
        </span>

        {pkg.savingsPercent ? (
          <span className="cm-showcase-card__savings">
            −{pkg.savingsPercent}%
          </span>
        ) : null}
      </figure>

      <div className="cm-showcase-card__body">
        <div className="cm-showcase-card__meta">
          <span className="cm-showcase-card__ordinal">{ordinal}</span>
          <span className="cm-showcase-card__rule" aria-hidden />
          <span className="cm-showcase-card__tag">
            {pkg.trekLabel || pkg.durationLabel}
          </span>
        </div>

        <h3 className="cm-showcase-card__title">{pkg.title}</h3>

        {pkg.description ? (
          <p className="cm-showcase-card__desc">{pkg.description}</p>
        ) : null}

        <dl className="cm-showcase-card__price">
          <dt className="sr-only">{isKa ? 'ფასი' : 'Price'}</dt>
          <dd className="cm-showcase-card__price-value">{pkg.priceLabel}</dd>
          {pkg.compareAtPrice && pkg.compareAtPrice > pkg.dailyRate ? (
            <dd className="cm-showcase-card__price-compare">
              <s>
                {pkg.compareAtPrice} {pkg.currency}
              </s>
            </dd>
          ) : null}
        </dl>
      </div>
    </Link>
  );
}
