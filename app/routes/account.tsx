import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {CUSTOMER_RENTAL_HISTORY_QUERY} from '~/graphql/customer-account/CustomerRentalHistoryQuery';
import {useLocale} from '~/providers/LocaleProvider';
import {
  getLoyaltyStatus,
  parseCustomerTags,
  RETURNS_FOR_TIER,
} from '~/lib/trailrent/loyalty';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const language = customerAccount.i18n.language;

  const [customerResult, rentalResult] = await Promise.all([
    customerAccount.query(CUSTOMER_DETAILS_QUERY, {
      variables: {language},
    }),
    customerAccount.query(CUSTOMER_RENTAL_HISTORY_QUERY, {
      variables: {language, first: 25},
    }),
  ]);

  const {data, errors} = customerResult;

  if (errors?.length || !data?.customer) {
    throw await customerAccount.handleAuthStatus();
  }

  const rentalOrders = rentalResult.data?.customer?.orders?.nodes ?? [];

  return remixData(
    {customer: data.customer, rentalOrders},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

function customerInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null,
) {
  const fromName = [firstName, lastName]
    .filter(Boolean)
    .map((part) => part!.charAt(0))
    .join('')
    .toUpperCase();
  if (fromName) return fromName.slice(0, 2);
  return email?.charAt(0).toUpperCase() ?? '?';
}

export default function AccountLayout() {
  const {customer, rentalOrders} = useLoaderData<typeof loader>();
  const {translations: tr, locale} = useLocale();

  const email = customer.emailAddress?.emailAddress ?? null;
  const tags = parseCustomerTags(customer.tags);
  const loyalty = getLoyaltyStatus({
    tags,
    email,
    orders: rentalOrders,
    tagsOnly: true,
  });

  const displayName =
    [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
    (locale === 'ka' ? 'მომხმარებელი' : 'Member');

  const greeting = customer.firstName
    ? locale === 'ka'
      ? `გამარჯობა, ${customer.firstName}`
      : `Hi, ${customer.firstName}`
    : locale === 'ka'
      ? 'თქვენი ანგარიში'
      : 'Your account';

  return (
    <div className="min-h-screen bg-mist">
      <div className="cm-account-header">
        <div className="cm-account-header-inner">
          <div
            className="cm-account-avatar"
            aria-hidden
          >
            {customerInitials(customer.firstName, customer.lastName, email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="tr-eyebrow">{tr.account.eyebrow}</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-pine md:text-3xl">
              {greeting}
            </h1>
            <p className="mt-1 truncate text-sm text-muted">{email ?? displayName}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={`cm-loyalty-tier-pill ${
                loyalty.isVerified ? 'cm-loyalty-tier-vip' : 'border border-stone bg-mist text-muted'
              }`}
            >
              {loyalty.isVerified ? tr.loyalty.trailTested : tr.loyalty.explorer}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              {loyalty.isVerified
                ? tr.loyalty.verified
                : locale === 'ka'
                  ? `${loyalty.cleanReturns}/${RETURNS_FOR_TIER} სუფთა დაბრუნება`
                  : `${loyalty.cleanReturns}/${RETURNS_FOR_TIER} clean returns`}
            </span>
          </div>
        </div>
      </div>

      <AccountMenu />

      <div className="tr-page-width py-6 md:py-8">
        <Outlet context={{customer, rentalOrders}} />
      </div>
    </div>
  );
}

function AccountMenu() {
  const {translations: tr} = useLocale();
  const links = [
    {to: '/account', label: tr.account.dashboard, end: true},
    {to: '/account/orders', label: tr.account.orders},
    {to: '/account/profile', label: tr.account.profile},
    {to: '/account/addresses', label: tr.account.addresses},
  ];

  return (
    <nav className="cm-account-nav" role="navigation" aria-label="Account">
      <div className="flex flex-1 flex-wrap">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({isActive}) =>
              `cm-account-nav-link ${isActive ? 'cm-account-nav-link-active' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <Logout />
    </nav>
  );
}

function Logout() {
  const {translations: tr} = useLocale();
  return (
    <Form className="ml-auto shrink-0" method="POST" action="/account/logout">
      <button
        type="submit"
        className="px-4 py-3.5 text-sm font-semibold text-muted transition hover:text-pine uppercase tracking-[0.08em]"
      >
        {tr.account.signOut}
      </button>
    </Form>
  );
}
