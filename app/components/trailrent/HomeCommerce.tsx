import {Link, useFetcher} from 'react-router';
import {useCallback, useEffect, useId, useRef, useState} from 'react';
import {SearchForm} from '~/components/SearchForm';
import {useLocale} from '~/providers/LocaleProvider';
import {PriceWithCompare} from '~/components/trailrent/PriceWithCompare';
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
  type PredictiveSearchReturn,
} from '~/lib/search';
import {
  IconArrowRight,
  IconCompass,
  IconMapPin,
  IconMetro,
  IconMountain,
  IconPackage,
  IconSearch,
  IconShield,
  IconStar,
  IconTent,
} from '~/components/trailrent/Icons';

const PROMO_IMAGE =
  'https://images.unsplash.com/photo-1478131143081-80f7f84b84c7?auto=format&fit=crop&w=2000&q=80';

const PACKAGE_TILE_IMAGE =
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=75';

const GEAR_TILE_IMAGE =
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=75';

const HOME_CATEGORIES = [
  {
    href: '/individual-gear?gear=tent',
    titleKa: 'კარავები',
    titleEn: 'Tents',
    tone: 'cm-home-cat--moss',
    Icon: IconTent,
  },
  {
    href: '/individual-gear?gear=sleeping',
    titleKa: 'საძილებელი',
    titleEn: 'Sleeping',
    tone: 'cm-home-cat--amber',
    Icon: IconStar,
  },
  {
    href: '/individual-gear?gear=backpack',
    titleKa: 'რუქსაკები',
    titleEn: 'Backpacks',
    tone: 'cm-home-cat--sage',
    Icon: IconCompass,
  },
  {
    href: '/individual-gear?gear=kitchen',
    titleKa: 'სამზარეულო',
    titleEn: 'Kitchen',
    tone: 'cm-home-cat--stone',
    Icon: IconPackage,
  },
  {
    href: '/individual-gear?gear=navigation',
    titleKa: 'ნავიგაცია',
    titleEn: 'Navigation',
    tone: 'cm-home-cat--forest',
    Icon: IconMapPin,
  },
  {
    href: '/packages',
    titleKa: 'კომპლექტები',
    titleEn: 'Full kits',
    tone: 'cm-home-cat--pine',
    Icon: IconMountain,
  },
] as const;

const HOME_QUICK_SEARCH = [
  {
    labelKa: 'კარავები',
    labelEn: 'Tents',
    queryKa: 'კარავი',
    queryEn: 'tent',
    Icon: IconTent,
  },
  {
    labelKa: 'რუქსაკები',
    labelEn: 'Backpacks',
    queryKa: 'რუქსაკი',
    queryEn: 'backpack',
    Icon: IconCompass,
  },
  {
    labelKa: 'საძილებელი',
    labelEn: 'Sleeping bags',
    queryKa: 'საძილებელი',
    queryEn: 'sleeping bag',
    Icon: IconStar,
  },
  {
    labelKa: 'კომპლექტები',
    labelEn: 'Trail kits',
    queryKa: 'კომპლექტი',
    queryEn: 'kit',
    Icon: IconMountain,
  },
  {
    labelKa: 'აწყობა',
    labelEn: 'Gear builder',
    href: '/gear-builder',
    Icon: IconPackage,
  },
] as const;

const HOW_STEPS = [
  {key: 'step1' as const, num: '1'},
  {key: 'step2' as const, num: '2'},
  {key: 'step3' as const, num: '3'},
  {key: 'step4' as const, num: '4'},
];

export function HomeSearchBar() {
  const {translations: tr, locale} = useLocale();
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'home-search'});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const listboxId = useId();

  const fetchResults = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      void fetcher.submit(
        {q: trimmed, limit: 6, predictive: true},
        {method: 'GET', action: '/search'},
      );
    },
    [fetcher],
  );

  useEffect(() => {
    function handleSlashFocus(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;
      if (isTyping) return;

      if (event.key === 'k' && event.metaKey) {
        event.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleSlashFocus);
    return () => document.removeEventListener('keydown', handleSlashFocus);
  }, []);

  useEffect(() => {
    if (!term.trim()) return;
    const timer = window.setTimeout(() => fetchResults(term), 220);
    return () => window.clearTimeout(timer);
  }, [term, fetchResults]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const predictive =
    fetcher.data?.type === 'predictive'
      ? fetcher.data.result
      : getEmptyPredictiveSearchResult();
  const {products, queries} = predictive.items;
  const trimmedTerm = term.trim();
  const hasTerm = Boolean(trimmedTerm);
  const isLoading = fetcher.state === 'loading' && hasTerm;
  const hasPredictiveResults = queries.length > 0 || products.length > 0;
  const showEmptyState = hasTerm && !isLoading && !hasPredictiveResults;

  const clearSearch = () => {
    setTerm('');
    inputRef.current?.focus();
  };

  return (
    <div className="cm-home-search-slot">
      <div ref={containerRef} className="cm-home-search">
        <SearchForm action="/search" className="cm-home-search-form">
          {() => (
            <div
              className="cm-home-search-field"
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-haspopup="listbox"
            >
              <IconSearch size={17} className="cm-home-search-icon" aria-hidden />
              <input
                ref={inputRef}
                className="cm-home-search-input"
                name="q"
                type="search"
                value={term}
                placeholder={tr.home.searchPlaceholder}
                autoComplete="off"
                aria-autocomplete="list"
                aria-controls={listboxId}
                onChange={(event) => {
                  setTerm(event.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
              />
              {hasTerm ? (
                <button
                  type="button"
                  className="cm-home-search-clear"
                  onClick={clearSearch}
                  aria-label={tr.home.searchClear}
                >
                  ×
                </button>
              ) : null}
            </div>
          )}
        </SearchForm>

        {open ? (
          <div className="cm-home-search-dropdown" id={listboxId} role="listbox">
            {!hasTerm ? (
              <div className="cm-home-search-panel-section">
                <p className="cm-home-search-panel-label">{tr.home.searchPopular}</p>
                <div className="cm-home-search-chips">
                  {HOME_QUICK_SEARCH.map((item) => {
                    const label = locale === 'ka' ? item.labelKa : item.labelEn;
                    const to =
                      'href' in item
                        ? item.href
                        : `/search?q=${encodeURIComponent(
                            locale === 'ka' ? item.queryKa : item.queryEn,
                          )}`;

                    return (
                      <Link
                        key={label}
                        to={to}
                        className="cm-home-search-chip"
                        onClick={() => setOpen(false)}
                      >
                        <item.Icon size={15} aria-hidden />
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {hasTerm ? (
              <div className="cm-home-search-panel-body">
                {isLoading ? (
                  <div className="cm-home-search-loading" aria-live="polite">
                    <span className="cm-home-search-spinner" aria-hidden />
                    <span>{tr.home.searching}</span>
                  </div>
                ) : null}

                {queries.length ? (
                  <div className="cm-home-search-panel-section">
                    <p className="cm-home-search-panel-label">
                      {tr.home.searchSuggestions}
                    </p>
                    <ul className="cm-home-search-suggestions">
                      {queries.map((suggestion) => {
                        if (!suggestion?.text) return null;
                        const searchUrl = `/search?q=${encodeURIComponent(
                          suggestion.text,
                        )}`;

                        return (
                          <li key={suggestion.text}>
                            <Link
                              to={searchUrl}
                              className="cm-home-search-suggestion"
                              onClick={() => setOpen(false)}
                            >
                              <IconSearch size={16} className="text-muted" aria-hidden />
                              <span>{suggestion.text}</span>
                              <IconArrowRight size={14} className="ml-auto opacity-40" aria-hidden />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}

                {products.length ? (
                  <div className="cm-home-search-panel-section">
                    <p className="cm-home-search-panel-label">
                      {tr.home.searchProducts}
                    </p>
                    <ul className="cm-home-search-products">
                      {products.map((product) => {
                        const productUrl = urlWithTrackingParams({
                          baseUrl: `/products/${product.handle}`,
                          trackingParams: product.trackingParameters,
                          term: trimmedTerm,
                        });
                        const variant = product.selectedOrFirstAvailableVariant;
                        const image = variant?.image;
                        const amount = variant?.price?.amount
                          ? Number(variant.price.amount)
                          : 0;
                        const compareAt = (
                          variant as {compareAtPrice?: {amount?: string} | null}
                        ).compareAtPrice?.amount
                          ? Number(
                              (
                                variant as {compareAtPrice?: {amount?: string}}
                              ).compareAtPrice!.amount,
                            )
                          : undefined;
                        const perDay = locale === 'ka' ? 'დღე' : 'day';

                        return (
                          <li key={product.id}>
                            <Link
                              to={productUrl}
                              className="cm-home-search-product group"
                              onClick={() => setOpen(false)}
                            >
                              {image?.url ? (
                                <img src={image.url} alt="" loading="lazy" />
                              ) : (
                                <span className="cm-home-search-product-fallback" aria-hidden>
                                  <IconPackage size={18} />
                                </span>
                              )}
                              <span className="cm-home-search-product-copy">
                                <span className="cm-home-search-product-title">
                                  {product.title}
                                </span>
                                {amount > 0 ? (
                                  <span className="cm-home-search-product-price">
                                    <PriceWithCompare
                                      amount={amount}
                                      compareAtAmount={compareAt}
                                      suffix={
                                        <>
                                          {' '}
                                          / {perDay}
                                        </>
                                      }
                                      size="compact"
                                    />
                                  </span>
                                ) : null}
                              </span>
                              <IconArrowRight
                                size={16}
                                className="cm-home-search-product-arrow"
                                aria-hidden
                              />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}

                {showEmptyState ? (
                  <p className="cm-home-search-empty">{tr.home.searchNoResults}</p>
                ) : null}

                {!isLoading && hasTerm ? (
                  <div className="cm-home-search-panel-footer">
                    <Link
                      to={`/search?q=${encodeURIComponent(trimmedTerm)}`}
                      className="cm-home-search-view-all"
                      onClick={() => setOpen(false)}
                    >
                      {tr.home.viewAllResults}
                      <IconArrowRight size={16} />
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function HomePromoBanner() {
  const {translations: tr} = useLocale();

  return (
    <Link to="/collections/all" className="cm-home-promo group">
      <img
        src={PROMO_IMAGE}
        alt=""
        className="cm-home-promo-image"
        fetchPriority="high"
      />
      <div className="cm-home-promo-overlay" aria-hidden />
      <div className="cm-home-promo-content">
        <p className="cm-home-promo-badge">{tr.home.promoBadge}</p>
        <h1 className="cm-home-promo-title">{tr.hero.title}</h1>
        <p className="cm-home-promo-subtitle">{tr.hero.subtitle}</p>
        <span className="cm-home-promo-cta">
          {tr.home.promoCta}
          <IconArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}

export function HomeQuickNav() {
  const {translations: tr} = useLocale();

  const links = [
    {to: '/packages', label: tr.nav.packages, Icon: IconMountain},
    {to: '/individual-gear', label: tr.nav.gear, Icon: IconTent},
    {to: '/gear-builder', label: tr.nav.gearBuilder, Icon: IconCompass},
    {to: '/collections/all', label: tr.home.allProducts, Icon: IconPackage},
    {to: '/pages/how-it-works', label: tr.home.howItWorksLink, Icon: IconMetro},
  ];

  return (
    <nav className="cm-home-quicknav" aria-label="Shop">
      {links.map(({to, label, Icon}) => (
        <Link key={to} to={to} className="cm-home-quicknav-item">
          <span className="cm-home-quicknav-icon" aria-hidden>
            <Icon size={18} />
          </span>
          <span className="cm-home-quicknav-label">{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function HomeCategories() {
  const {locale, translations: tr} = useLocale();

  return (
    <section className="cm-home-categories" aria-labelledby="home-categories-heading">
      <div className="tr-page-width">
        <div className="cm-home-section-head">
          <h2 id="home-categories-heading" className="cm-home-section-title">
            <IconTent size={20} className="text-moss" aria-hidden />
            {tr.home.categoriesTitle}
          </h2>
        </div>
        <div className="cm-home-cat-grid">
          {HOME_CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              to={cat.href}
              className={`cm-home-cat ${cat.tone}`}
            >
              <span className="cm-home-cat-icon" aria-hidden>
                <cat.Icon size={28} />
              </span>
              <span className="cm-home-cat-label">
                {locale === 'ka' ? cat.titleKa : cat.titleEn}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const BUILDER_TILE_IMAGE =
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=75';

export function HomeShopTiles() {
  const {translations: tr} = useLocale();

  const tiles = [
    {
      to: '/packages',
      image: PACKAGE_TILE_IMAGE,
      title: tr.home.shopPackagesTitle,
      desc: tr.home.shopPackagesDesc,
      accent: 'cm-home-tile--packages',
    },
    {
      to: '/individual-gear',
      image: GEAR_TILE_IMAGE,
      title: tr.home.shopGearTitle,
      desc: tr.home.shopGearDesc,
      accent: 'cm-home-tile--gear',
    },
    {
      to: '/gear-builder',
      image: BUILDER_TILE_IMAGE,
      title: tr.home.shopBuilderTitle,
      desc: tr.home.shopBuilderDesc,
      accent: 'cm-home-tile--builder',
    },
  ];

  return (
    <section className="cm-home-tiles" aria-label="Shop">
      <div className="cm-home-tile-grid">
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to} className={`cm-home-tile ${tile.accent}`}>
            <img
              src={tile.image}
              alt=""
              className="cm-home-tile-image"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <div className="cm-home-tile-overlay" aria-hidden />
            <div className="cm-home-tile-body">
              <h3 className="cm-home-tile-title">{tile.title}</h3>
              <p className="cm-home-tile-desc">{tile.desc}</p>
              <span className="cm-home-tile-cta">
                {tr.home.shopCta}
                <IconArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomePerksStrip() {
  const {translations: tr} = useLocale();

  const perks = [
    {Icon: IconMetro, label: tr.trust.metro},
    {Icon: IconShield, label: tr.trust.deposit},
    {Icon: IconStar, label: tr.trust.loyalty},
  ];

  return (
    <div className="cm-home-perks" role="list">
      {perks.map(({Icon, label}) => (
        <div key={label} className="cm-home-perk" role="listitem">
          <Icon size={16} className="text-moss" aria-hidden />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function HomeHowItWorksCompact() {
  const {translations: tr} = useLocale();

  return (
    <section className="cm-home-steps" aria-labelledby="home-steps-heading">
      <div className="cm-home-section-head">
        <h2 id="home-steps-heading" className="cm-home-section-title">
          {tr.howItWorks.title}
        </h2>
        <Link to="/pages/how-it-works" className="cm-home-section-link">
          {tr.home.stepsLink}
          <IconArrowRight size={14} />
        </Link>
      </div>
      <div className="cm-home-steps-grid">
        {HOW_STEPS.map(({key, num}) => (
          <div key={key} className="cm-home-step">
            <span className="cm-home-step-num">{num}</span>
            <h3 className="cm-home-step-title">{tr.howItWorks[key]}</h3>
            <p className="cm-home-step-desc">{tr.howItWorks[`${key}Desc`]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
