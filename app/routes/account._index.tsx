import {Link, useLoaderData, useOutletContext} from 'react-router';
import type {Route} from './+types/account._index';
import {useLocale} from '~/providers/LocaleProvider';
import {
  IconArrowRight,
  IconBag,
  IconLayers,
  IconMetro,
  IconMountain,
  IconPackage,
  IconShield,
  IconStar,
} from '~/components/trailrent/Icons';
import {
  getLoyaltyStatus,
  parseCustomerTags,
} from '~/lib/trailrent/loyalty';
import type {CustomerDetailsQuery} from 'customer-accountapi.generated';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {readGearBuilderLibrary} from '~/lib/trailrent/gear-builder/storage';
import type {SavedGearBuild} from '~/lib/trailrent/gear-builder';
import {TREK_FILTERS} from '~/lib/trailrent/catalog';
import {GearTypeIcon, gearTypeLabel} from '~/components/trailrent/GearBuilderPanel';

export async function loader({context}: Route.LoaderArgs) {
  const {data} = await context.customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {language: context.customerAccount.i18n.language},
  });
  const customerId = data?.customer?.id ?? null;
  const library = readGearBuilderLibrary(context.session, customerId);
  return {savedBuilds: library.builds};
}

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Account'},
];

type AccountContext = {
  customer: CustomerDetailsQuery['customer'];
};

export default function AccountDashboard() {
  const {customer} = useOutletContext<AccountContext>();
  const {savedBuilds} = useLoaderData<typeof loader>();
  const {translations: tr, locale} = useLocale();

  const email = customer.emailAddress?.emailAddress ?? null;
  const tags = parseCustomerTags(customer.tags);
  const loyalty = getLoyaltyStatus({tags, email, tagsOnly: true});

  const benefits = loyalty.isVerified
    ? [tr.loyalty.benefitDeposit, tr.loyalty.benefitPriority, tr.loyalty.benefitUpgrade]
    : [tr.loyalty.benefitId, tr.loyalty.benefitMetro, tr.loyalty.benefitProgress];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <LoyaltyCard status={loyalty} benefits={benefits} />
        <SavedGearBuilderCard savedBuilds={savedBuilds} locale={locale} />
      </div>

      <aside className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
          {tr.account.quickLinks}
        </h2>
        <QuickLink to="/account/orders" icon={IconBag} label={tr.account.viewOrders} />
        <QuickLink to="/packages" icon={IconPackage} label={tr.account.bookKit} />
        <QuickLink to="/individual-gear" icon={IconMetro} label={tr.account.browseGear} />
        <QuickLink to="/gear-builder" icon={IconLayers} label={tr.account.editGearBuilder} />
      </aside>
    </div>
  );
}

function trekLabelFor(value: string | undefined, locale: 'ka' | 'en') {
  if (!value) return null;
  const trek = TREK_FILTERS.find((entry) => entry.value === value);
  if (!trek) return value;
  return locale === 'ka' ? trek.labelKa : trek.labelEn;
}

function SavedGearBuilderCard({
  savedBuilds,
  locale,
}: {
  savedBuilds: SavedGearBuild[];
  locale: 'ka' | 'en';
}) {
  const {translations: tr} = useLocale();

  return (
    <div className="cm-gear-builder-account-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-moss">
            {tr.gearBuilder.eyebrow}
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-pine">
            {tr.gearBuilder.accountBuildsTitle}
          </h2>
        </div>
        <Link to="/gear-builder" className="tr-btn-secondary text-sm">
          {tr.gearBuilder.accountNewBuild}
          <IconArrowRight size={14} />
        </Link>
      </div>

      {savedBuilds.length ? (
        <div className="mt-4 space-y-3">
          {savedBuilds.map((build) => {
            const filled = build.slots.filter((slot) => slot.productId);
            const trekLabel = trekLabelFor(build.trek, locale);
            const title =
              build.name.trim() || tr.gearBuilder.accountUntitled;

            return (
              <article key={build.id} className="cm-gear-builder-account-build">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-pine">{title}</h3>
                    {trekLabel ? (
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-moss">
                        <IconMountain size={14} />
                        {trekLabel}
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm text-muted">
                      {filled.length} {tr.gearBuilder.itemsSelected}
                    </p>
                  </div>
                  <Link
                    to={`/gear-builder?build=${build.id}`}
                    className="tr-btn-secondary text-sm"
                  >
                    {tr.gearBuilder.accountEdit}
                    <IconArrowRight size={14} />
                  </Link>
                </div>
                {filled.length ? (
                  <ul className="mt-3 space-y-1.5 text-sm text-charcoal/85">
                    {filled.map((slot) => (
                      <li key={slot.itemType} className="flex items-center gap-2">
                        <GearTypeIcon type={slot.itemType} size={15} className="text-moss" />
                        {slot.title ?? gearTypeLabel(slot.itemType, locale)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">{tr.gearBuilder.accountEmpty}</p>
      )}
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
