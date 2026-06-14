import {Link} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {
  IconMetro,
  IconShield,
  IconStar,
} from '~/components/trailrent/Icons';

export function AnnouncementBar() {
  const {translations} = useLocale();

  return (
    <div className="cm-announcement-bar" role="note" aria-label={translations.announcement}>
      <div className="tr-page-width cm-announcement-bar-inner">
        {translations.announcement}
      </div>
    </div>
  );
}

export function LanguageSwitcher() {
  const {locale, setLocale} = useLocale();

  return (
    <div className="flex items-center gap-1 rounded-sm border border-white/20 p-0.5 text-xs">
      <button
        type="button"
        onClick={() => setLocale('ka')}
        className={`rounded-sm px-2 py-1 ${locale === 'ka' ? 'bg-white/15 text-mist' : 'text-sage hover:text-mist'}`}
      >
        ქარ
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`rounded-sm px-2 py-1 ${locale === 'en' ? 'bg-white/15 text-mist' : 'text-sage hover:text-mist'}`}
      >
        EN
      </button>
    </div>
  );
}

export function CatalogPageHeading({title}: {title: string}) {
  return <h1 className="cm-catalog-heading">{title}</h1>;
}

export function PageBanner({
  eyebrow,
  title,
  subtitle,
  compact,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <section className={`cm-page-banner${compact ? ' cm-page-banner--compact' : ''}`}>
      <div className="tr-page-width cm-page-banner-inner">
        <div className="cm-page-banner-row">
          <div className="min-w-0">
            {eyebrow ? <p className="cm-page-banner-eyebrow">{eyebrow}</p> : null}
            <h1 className="cm-page-banner-title">{title}</h1>
          </div>
          {subtitle ? (
            <p className="cm-page-banner-subtitle">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-8 max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow ? <p className="tr-eyebrow mb-2">{eyebrow}</p> : null}
      <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
      {subtitle ? (
        <p className="mt-2 text-base leading-relaxed text-charcoal/80">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function TrustPillars() {
  const {translations: tr} = useLocale();
  const items = [
    {key: 'metro', Icon: IconMetro},
    {key: 'deposit', Icon: IconShield},
    {key: 'loyalty', Icon: IconStar},
  ] as const;

  return (
    <div className="grid gap-6 border-t border-white/10 pt-8 md:grid-cols-3">
      {items.map(({key, Icon}) => (
        <div key={key} className="flex gap-4">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-amber"
            aria-hidden
          >
            <Icon size={20} />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold text-mist">
              {tr.trust[key]}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-sage">
              {tr.trust[`${key}Desc` as keyof typeof tr.trust]}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdventureHero() {
  const {translations: tr} = useLocale();

  return (
    <section className="relative overflow-hidden bg-pine text-mist">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'linear-gradient(135deg, rgba(13,40,24,0.95) 0%, rgba(26,61,46,0.85) 50%, rgba(74,124,89,0.4) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(212,165,116,0.15),transparent_50%)]" />

      <div className="tr-page-width relative py-20 md:py-28">
        <p className="tr-eyebrow mb-4 text-sage">{tr.hero.eyebrow}</p>
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-mist md:text-6xl">
          {tr.hero.title}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-sage">
          {tr.hero.subtitle}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/packages" className="tr-btn-primary">
            {tr.hero.ctaPackages}
          </Link>
          <Link to="/individual-gear" className="tr-btn-ghost">
            {tr.hero.ctaGear}
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap gap-6 text-sm text-sage">
          <span>{tr.hero.statRating}</span>
          <span>{tr.hero.statRenters}</span>
          <span className="font-semibold text-amber">{tr.hero.statDeposit}</span>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Link
            to="/packages"
            className="tr-card group border-white/10 bg-white/5 p-6 backdrop-blur hover:bg-white/10"
          >
            <h3 className="font-display text-xl font-semibold text-mist group-hover:text-amber">
              {tr.intent.leftTitle}
            </h3>
            <p className="mt-2 text-sm text-sage">{tr.intent.leftDesc}</p>
          </Link>
          <Link
            to="/individual-gear"
            className="tr-card group border-white/10 bg-white/5 p-6 backdrop-blur hover:bg-white/10"
          >
            <h3 className="font-display text-xl font-semibold text-mist group-hover:text-amber">
              {tr.intent.rightTitle}
            </h3>
            <p className="mt-2 text-sm text-sage">{tr.intent.rightDesc}</p>
          </Link>
        </div>

        <TrustPillars />
      </div>
    </section>
  );
}
