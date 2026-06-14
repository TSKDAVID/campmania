import {Link, useOutletContext} from 'react-router';
import type {Route} from './+types/account._index';
import {useLocale} from '~/providers/LocaleProvider';
import {
  IconArrowRight,
  IconBag,
  IconMetro,
  IconPackage,
  IconShield,
  IconStar,
} from '~/components/trailrent/Icons';
import {
  getLoyaltyStatus,
  parseCustomerTags,
} from '~/lib/trailrent/loyalty';
import type {CustomerDetailsQuery} from 'customer-accountapi.generated';

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

  const benefits = loyalty.isVerified
    ? [tr.loyalty.benefitDeposit, tr.loyalty.benefitPriority, tr.loyalty.benefitUpgrade]
    : [tr.loyalty.benefitId, tr.loyalty.benefitMetro, tr.loyalty.benefitProgress];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <LoyaltyCard status={loyalty} benefits={benefits} />
      </div>

      <aside className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
          {tr.account.quickLinks}
        </h2>
        <QuickLink to="/account/orders" icon={IconBag} label={tr.account.viewOrders} />
        <QuickLink to="/packages" icon={IconPackage} label={tr.account.bookKit} />
        <QuickLink to="/individual-gear" icon={IconMetro} label={tr.account.browseGear} />
      </aside>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof IconBag;
  label: string;
}) {
  return (
    <Link to={to} className="cm-quick-link group">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pine/10 text-forest transition group-hover:bg-pine group-hover:text-mist">
        <Icon size={18} />
      </span>
      <span className="flex-1">{label}</span>
      <IconArrowRight size={14} className="text-muted opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}

function LoyaltyCard({
  status,
  benefits,
}: {
  status: ReturnType<typeof getLoyaltyStatus>;
  benefits: string[];
}) {
  const {translations: tr} = useLocale();

  return (
    <div className="cm-loyalty-card">
      <div className="cm-loyalty-card-banner">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sage">
              {tr.loyalty.eyebrow}
            </p>
            <h2 className="mt-1 font-display text-xl font-bold md:text-2xl">
              {tr.loyalty.title}
            </h2>
          </div>
          <span
            className={`cm-loyalty-tier-pill ${
              status.isVerified ? 'cm-loyalty-tier-vip' : 'cm-loyalty-tier-explorer'
            }`}
          >
            {status.isVerified ? tr.loyalty.trailTested : tr.loyalty.explorer}
          </span>
        </div>
      </div>

      <div className="p-5 md:p-6">
        {status.isVerified ? (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-amber/10 px-4 py-3 text-sm font-semibold text-forest">
            <IconStar size={18} className="text-amber" />
            {tr.loyalty.verified}
          </div>
        ) : (
          <div className="mb-5">
            <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-wide text-muted">
              <span>{tr.loyalty.progress}</span>
              <span>{status.progressPercent}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-stone"
              role="progressbar"
              aria-valuenow={status.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={tr.loyalty.progress}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-moss to-amber transition-all"
                style={{width: `${status.progressPercent}%`}}
              />
            </div>
            <p className="mt-2 text-sm text-muted">{tr.loyalty.oneMoreReturn}</p>
          </div>
        )}

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-moss">
          {tr.loyalty.yourBenefits}
        </p>
        <ul className="space-y-2.5">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-sm text-charcoal/85">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/15 text-moss">
                <IconShield size={12} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
