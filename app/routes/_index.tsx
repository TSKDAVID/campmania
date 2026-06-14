import {Link} from 'react-router';
import type {Route} from './+types/_index';
import {useLocale} from '~/providers/LocaleProvider';

/**
 * Homepage loader — intentionally minimal.
 * No deferred Storefront product query: the homepage is an editorial
 * intent router, not a product grid. Keeps TTFB fast before Shopify is linked.
 */
export async function loader(_args: Route.LoaderArgs) {
  return {};
}

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Premium Hiking Gear Rental — Tbilisi'},
];

export default function Homepage() {
  const {translations: tr} = useLocale();

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-pine text-mist">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'linear-gradient(135deg, rgba(13,40,24,0.95) 0%, rgba(26,61,46,0.85) 50%, rgba(74,124,89,0.4) 100%)',
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(212,165,116,0.15),transparent_50%)]" aria-hidden />

        <div className="tr-page-width relative py-20 md:py-28">
          <p className="tr-eyebrow mb-4 text-sage">{tr.hero.eyebrow}</p>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-mist md:text-6xl">
            {tr.hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-sage">
            {tr.hero.subtitle}
          </p>

          {/* ── Intent Router — two visual paths ─────────────────────────── */}
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <Link
              to="/packages"
              className="tr-card group relative overflow-hidden border-white/10 bg-white/5 p-8 backdrop-blur transition hover:bg-white/10"
            >
              <div
                className="absolute inset-0 opacity-20 transition group-hover:opacity-30"
                style={{
                  background:
                    'linear-gradient(160deg, rgba(74,124,89,0.6) 0%, transparent 60%)',
                }}
                aria-hidden
              />
              <div className="relative">
                <span className="tr-eyebrow text-sage">{tr.nav.packages}</span>
                <h2 className="mt-2 font-display text-2xl font-semibold text-mist group-hover:text-amber">
                  {tr.intent.leftTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-sage">
                  {tr.intent.leftDesc}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber">
                  {tr.hero.ctaPackages}
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>

            <Link
              to="/individual-gear"
              className="tr-card group relative overflow-hidden border-white/10 bg-white/5 p-8 backdrop-blur transition hover:bg-white/10"
            >
              <div
                className="absolute inset-0 opacity-20 transition group-hover:opacity-30"
                style={{
                  background:
                    'linear-gradient(160deg, rgba(212,165,116,0.25) 0%, transparent 60%)',
                }}
                aria-hidden
              />
              <div className="relative">
                <span className="tr-eyebrow text-sage">{tr.nav.gear}</span>
                <h2 className="mt-2 font-display text-2xl font-semibold text-mist group-hover:text-amber">
                  {tr.intent.rightTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-sage">
                  {tr.intent.rightDesc}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber">
                  {tr.hero.ctaGear}
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust Signals banner ─────────────────────────────────────────── */}
      <TrustSignalsBanner />
    </div>
  );
}

/** Horizontal trust strip — Metro Delivery, Zero Cash Deposits, Trusted Tiers. */
function TrustSignalsBanner() {
  const {translations: tr} = useLocale();
  const items = [
    {key: 'metro' as const, icon: '🚇'},
    {key: 'deposit' as const, icon: '🛡️'},
    {key: 'loyalty' as const, icon: '⭐'},
  ];

  return (
    <section className="border-y border-stone bg-mist" aria-label="Trust signals">
      <div className="tr-page-width tr-section">
        <div className="grid gap-8 md:grid-cols-3">
          {items.map(({key, icon}) => (
            <div key={key} className="flex gap-4">
              <span className="text-2xl" aria-hidden>
                {icon}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-pine">
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
