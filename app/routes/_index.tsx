import {Link} from 'react-router';
import type {Route} from './+types/_index';
import {useLocale} from '~/providers/LocaleProvider';
import {SectionHeading} from '~/components/trailrent/HomeSections';
import {
  HowItWorksSection,
  CategoryGridSection,
  WhyUsSection,
  ReviewsSection,
  FaqSection,
  CtaSection,
} from '~/components/trailrent/ContentSections';

/** Premium hero — Unsplash CDN, mountains/outdoor editorial. */
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80';

export async function loader(_args: Route.LoaderArgs) {
  return {};
}

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Premium Hiking Gear Rental — Tbilisi'},
];

export default function Homepage() {
  return (
    <div className="overflow-hidden">
      <HomeHero />
      <TrustStrip />
      <IntentRouterSection />
      <HowItWorksSection />
      <CategoryGridSection />
      <WhyUsSection />
      <ReviewsSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}

function HomeHero() {
  const {translations: tr} = useLocale();

  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-pine text-mist">
      {/* Background photo */}
      <img
        src={HERO_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      {/* Layered overlays for readability */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-pine/95 via-pine/80 to-pine/40"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-pine/90 via-transparent to-pine/30"
        aria-hidden
      />

      <div className="tr-page-width relative flex min-h-[88vh] flex-col justify-center py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Copy */}
          <div className="lg:col-span-7">
            <p className="tr-eyebrow mb-5 text-amber">{tr.hero.eyebrow}</p>
            <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.08] text-mist md:text-5xl lg:text-6xl">
              {tr.hero.title}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-sage md:text-xl">
              {tr.hero.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/packages" className="tr-btn-primary bg-amber text-pine hover:bg-amber/90">
                {tr.hero.ctaPackages}
              </Link>
              <Link to="/individual-gear" className="tr-btn-ghost">
                {tr.hero.ctaGear}
              </Link>
            </div>
          </div>

          {/* Stats card */}
          <div className="lg:col-span-5">
            <div className="tr-card-elevated border-white/20 bg-white/10 p-8 backdrop-blur-md">
              <p className="tr-eyebrow text-sage">
                {tr.brand} · Trusted Tier
              </p>
              <ul className="mt-6 space-y-5">
                <StatRow label={tr.hero.statRating} value="4.9" />
                <StatRow label={tr.hero.statRenters} value="500+" />
                <StatRow
                  label={tr.trust.deposit}
                  value="0 ₾"
                  highlight
                />
              </ul>
              <div className="mt-8 border-t border-white/15 pt-6">
                <p className="text-sm leading-relaxed text-sage">
                  {tr.trust.metroDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
      <span className="text-sm text-sage">{label}</span>
      <span
        className={`font-display text-2xl font-bold ${highlight ? 'text-amber' : 'text-mist'}`}
      >
        {value}
      </span>
    </li>
  );
}

function TrustStrip() {
  const {translations: tr} = useLocale();
  const items = [
    {key: 'metro' as const, icon: '🚇'},
    {key: 'deposit' as const, icon: '🛡️'},
    {key: 'loyalty' as const, icon: '⭐'},
  ];

  return (
    <section className="border-b border-stone bg-white" aria-label="Trust signals">
      <div className="tr-page-width py-8 md:py-10">
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {items.map(({key, icon}) => (
            <div
              key={key}
              className="flex items-start gap-4 rounded-lg border border-stone/60 bg-mist/50 p-5"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pine/10 text-xl"
                aria-hidden
              >
                {icon}
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-pine">
                  {tr.trust[key]}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {tr.trust[`${key}Desc` as keyof typeof tr.trust]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntentRouterSection() {
  const {translations: tr, locale} = useLocale();

  const cards = [
    {
      to: '/packages',
      num: '01',
      eyebrow: tr.nav.packages,
      title: tr.intent.leftTitle,
      desc: tr.intent.leftDesc,
      cta: tr.hero.ctaPackages,
      accent: 'from-moss/20 to-transparent',
    },
    {
      to: '/individual-gear',
      num: '02',
      eyebrow: tr.nav.gear,
      title: tr.intent.rightTitle,
      desc: tr.intent.rightDesc,
      cta: tr.hero.ctaGear,
      accent: 'from-amber/20 to-transparent',
    },
  ];

  return (
    <section className="tr-section bg-mist">
      <div className="tr-page-width">
        <SectionHeading
          eyebrow={tr.brand}
          title={locale === 'ka' ? 'აირჩიეთ თქვენი გზა' : 'Choose your path'}
          subtitle={
            locale === 'ka'
              ? 'სრული trail კომპლექტი ან ინდივიდუალური აღჭურვილობა — ორივე მეტროში მიღებით.'
              : 'Complete trail kit or à-la-carte gear — both with metro hub pickup.'
          }
          center
        />
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="tr-card-elevated group relative overflow-hidden p-0"
            >
              <div
                className={`h-32 bg-gradient-to-br ${card.accent} bg-stone/30 md:h-40`}
                aria-hidden
              />
              <div className="relative p-8">
                <span className="text-5xl font-bold text-stone/80">{card.num}</span>
                <p className="tr-eyebrow mt-4">{card.eyebrow}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-pine transition group-hover:text-forest">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{card.desc}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-moss transition group-hover:gap-3 group-hover:text-forest">
                  {card.cta}
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
