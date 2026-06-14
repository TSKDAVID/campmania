import {useState} from 'react';
import {useLocale} from '~/providers/LocaleProvider';
import {
  getLoyaltyStatus,
  type LoyaltyStatus,
  type LoyaltyTier,
} from '~/lib/trailrent/loyalty';

export function LoyaltyCard({
  email,
  tags = [],
}: {
  email?: string | null;
  tags?: string[];
}) {
  const {translations: tr} = useLocale();
  const [demoTier, setDemoTier] = useState<LoyaltyTier | null>(null);
  const status: LoyaltyStatus = getLoyaltyStatus({tags, email, demoTier});

  return (
    <div className="overflow-hidden rounded-md border border-moss/40 bg-gradient-to-br from-pine via-forest to-moss text-mist shadow-lg">
      <div className="p-6 md:p-8">
        <p className="tr-eyebrow text-sage">{tr.loyalty.eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl font-bold">{tr.loyalty.title}</h2>

        <div className="mt-6 flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              status.isVerified
                ? 'bg-amber text-pine'
                : 'bg-white/15 text-mist'
            }`}
          >
            {status.isVerified ? tr.loyalty.trailTested : tr.loyalty.explorer}
          </span>
          {status.isVerified ? (
            <span className="text-sm text-sage">✓ {tr.loyalty.verified}</span>
          ) : null}
        </div>

        {!status.isVerified ? (
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span>{tr.loyalty.progress}</span>
              <span>{status.progressPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber to-sage transition-all"
                style={{width: `${status.progressPercent}%`}}
              />
            </div>
            <p className="mt-2 text-sm text-sage">{tr.loyalty.oneMoreReturn}</p>
          </div>
        ) : null}

        <ul className="mt-6 space-y-2 text-sm text-sage">
          {status.benefits.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-amber">•</span>
              {b}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() =>
            setDemoTier(
              status.tier === 'trail-tested' ? 'explorer' : 'trail-tested',
            )
          }
          className="mt-6 rounded-sm border border-white/20 px-3 py-1.5 text-xs text-sage hover:bg-white/10"
        >
          {tr.loyalty.demoToggle}
        </button>
      </div>
    </div>
  );
}
