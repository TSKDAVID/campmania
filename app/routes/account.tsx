import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {useLocale} from '~/providers/LocaleProvider';
import {
  getLoyaltyStatus,
  parseCustomerTags,
} from '~/lib/trailrent/loyalty';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw await customerAccount.handleAuthStatus();
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();
  const {translations: tr, locale} = useLocale();

  const email = customer.emailAddress?.emailAddress ?? null;
  const tags = parseCustomerTags(customer.tags);
  const loyalty = getLoyaltyStatus({tags, email, tagsOnly: true});

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
    <div className="cm-account-layout">
      <header style={{gridColumn: '1 / -1', paddingBottom: 'var(--space-3)', borderBottom: 'var(--border)'}}>
        <p className="text-xs text-muted" style={{textTransform: 'uppercase', letterSpacing: '0.08em'}}>
          {tr.account.eyebrow}
        </p>
        <h1 className="text-2xl" style={{margin: 'var(--space-1) 0'}}>{greeting}</h1>
        <p className="text-sm text-muted">{email ?? displayName}</p>
        <span className="cm-tag" style={{marginTop: 'var(--space-2)', display: 'inline-block'}}>
          {loyalty.isVerified ? tr.loyalty.trailTested : tr.loyalty.explorer}
        </span>
      </header>

      <AccountMenu />

      <div>
        <Outlet context={{customer}} />
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
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({isActive}) => (isActive ? 'active' : undefined)}
        >
          {link.label}
        </NavLink>
      ))}
      <Logout />
    </nav>
  );
}

function Logout() {
  const {translations: tr} = useLocale();
  return (
    <Form method="POST" action="/account/logout">
      <button type="submit" className="cm-btn cm-btn--outline" style={{width: '100%', marginTop: 'var(--space-2)'}}>
        {tr.account.signOut}
      </button>
    </Form>
  );
}
