import {useOutletContext} from 'react-router';
import type {Route} from './+types/account._index';
import {useLocale} from '~/providers/LocaleProvider';
import {
  getLoyaltyStatus,
  parseCustomerTags,
} from '~/lib/trailrent/loyalty';
import type {CustomerDetailsQuery} from 'customer-accountapi.generated';

/**
 * Account dashboard loader — parent `account.tsx` already fetches the customer
 * via CUSTOMER_DETAILS_QUERY (including `tags`). Child loader is a no-op passthrough
 * so this route can declare its own meta and remain independently cacheable.
 */
export async function loader(_args: Route.LoaderArgs) {
  return {};
}

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Account'},
];

type AccountContext = {
  customer: CustomerDetailsQuery['customer'];
};

export default function AccountDashboard() {
  const {customer} = useOutletContext<AccountContext>();
  const {translations: tr, locale} = useLocale();

  const email = customer.emailAddress?.emailAddress ?? null;
  const tags = parseCustomerTags(customer.tags);
  const loyalty = getLoyaltyStatus({tags, email, tagsOnly: true});

  return (
    <div className="space-y-8">
      {email ? (
        <p className="text-sm text-muted">{email}</p>
      ) : null}

      <LoyaltyProgressCard status={loyalty} />

      {/* ── Quick links ─────────────────────────────────────────────────── */}
      <div className="tr-card p-6">
        <h2 className="font-display text-xl font-bold">
          {locale === 'ka' ? 'სწრაფი ბმულები' : 'Quick links'}
        </h2>
        <ul className="mt-4 space-y-2 text-moss">
          <li>
            <a href="/account/orders" className="cm-link">
              {locale === 'ka' ? 'შეკვეთები' : 'Orders'}
            </a>
          </li>
          <li>
            <a href="/packages" className="cm-link">
              {tr.nav.packages}
            </a>
          </li>
          <li>
            <a href="/individual-gear" className="cm-link">
              {tr.nav.gear}
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

/** Inline loyalty card — VIP (Trail Tested) vs Tier 1 (Explorer) states. */
function LoyaltyProgressCard({
  status,
}: {
  status: ReturnType<typeof getLoyaltyStatus>;
}) {
  const {translations: tr} = useLocale();

  return (
    <div className="overflow-hidden rounded-md border border-moss/40 bg-gradient-to-br from-pine via-forest to-moss text-mist shadow-lg">
      <div className="p-6 md:p-8">
        <p className="tr-eyebrow text-sage">{tr.loyalty.eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl font-bold">
          {tr.loyalty.title}
        </h2>

        {/* Tier badge */}
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

        {/* Progress bar — Tier 1 only */}
        {!status.isVerified ? (
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span>{tr.loyalty.progress}</span>
              <span>{status.progressPercent}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuenow={status.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={tr.loyalty.progress}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber to-sage transition-all"
                style={{width: `${status.progressPercent}%`}}
              />
            </div>
            <p className="mt-2 text-sm text-sage">{tr.loyalty.oneMoreReturn}</p>
          </div>
        ) : null}

        {/* Benefits list */}
        <ul className="mt-6 space-y-2 text-sm text-sage">
          {status.benefits.map((benefit) => (
            <li key={benefit} className="flex gap-2">
              <span className="text-amber" aria-hidden>
                •
              </span>
              {benefit}
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs leading-relaxed text-sage/90">
          {tr.loyalty.shopifyNote}
        </p>
      </div>
    </div>
  );
}
