import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {useLocale} from '~/providers/LocaleProvider';
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
    titleKa: 'ანსამბლები',
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

const HOW_STEPS = [
  {key: 'step1' as const, num: '1'},
  {key: 'step2' as const, num: '2'},
  {key: 'step3' as const, num: '3'},
  {key: 'step4' as const, num: '4'},
];

export function HomeSearchBar() {
  const {open} = useAside();
  const {translations: tr} = useLocale();

  return (
    <button
      type="button"
      className="cm-home-search"
      onClick={() => open('search')}
      aria-label={tr.nav.search}
    >
      <IconSearch size={18} className="text-muted" />
      <span className="truncate">{tr.home.searchPlaceholder}</span>
    </button>
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
