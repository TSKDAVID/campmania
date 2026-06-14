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
    throw new Error('Customer not found');
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
  const {locale} = useLocale();

  const heading = customer.firstName
    ? locale === 'ka'
      ? `გამარჯობა, ${customer.firstName}`
      : `Welcome, ${customer.firstName}`
    : locale === 'ka'
      ? 'თქვენი ანგარიში'
      : 'Your account';

  return (
    <div className="bg-mist">
      <div className="border-b border-stone bg-white">
        <div className="tr-page-width py-10 md:py-12">
          <p className="tr-eyebrow">{locale === 'ka' ? 'ანგარიში' : 'Account'}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-pine md:text-4xl">
            {heading}
          </h1>
        </div>
      </div>

      <div className="tr-page-width py-8 md:py-12">
        <AccountMenu />
        <div className="mt-8">
          <Outlet context={{customer}} />
        </div>
      </div>
    </div>
  );
}

function AccountMenu() {
  const {locale} = useLocale();
  const links = [
    {to: '/account', label: locale === 'ka' ? 'პანელი' : 'Dashboard', end: true},
    {to: '/account/orders', label: locale === 'ka' ? 'შეკვეთები' : 'Orders'},
    {to: '/account/profile', label: locale === 'ka' ? 'პროფილი' : 'Profile'},
    {to: '/account/addresses', label: locale === 'ka' ? 'მისამართები' : 'Addresses'},
  ];

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-stone pb-4"
      role="navigation"
      aria-label="Account"
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({isActive}) =>
            `rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? 'bg-pine text-mist'
                : 'bg-white text-muted hover:bg-stone/80 hover:text-charcoal'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
      <Logout />
    </nav>
  );
}

function Logout() {
  const {locale} = useLocale();
  return (
    <Form className="ml-auto" method="POST" action="/account/logout">
      <button
        type="submit"
        className="rounded-full border border-stone bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:border-pine hover:text-pine"
      >
        {locale === 'ka' ? 'გასვლა' : 'Sign out'}
      </button>
    </Form>
  );
}
