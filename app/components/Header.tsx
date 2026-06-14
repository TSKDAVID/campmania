import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {LanguageSwitcher} from '~/components/trailrent/HomeSections';
import {IconBag, IconMenu, IconSearch} from '~/components/trailrent/Icons';
import {useLocale} from '~/providers/LocaleProvider';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

type NavItem = {
  id: string;
  to: string;
  label: string;
  end?: boolean;
};

/** Campmania primary navigation — always use branded routes, not Shopify default menu. */
function useCampmaniaNav(): NavItem[] {
  const {translations: tr} = useLocale();
  return [
    {id: 'home', to: '/', label: tr.nav.home, end: true},
    {id: 'packages', to: '/packages', label: tr.nav.packages},
    {id: 'gear', to: '/individual-gear', label: tr.nav.gear},
    {id: 'how', to: '/pages/how-it-works', label: tr.nav.howItWorks},
    {id: 'faq', to: '/pages/faq', label: tr.nav.faq},
  ];
}

export function Header({
  isLoggedIn,
  cart,
}: HeaderProps) {
  const {translations: tr} = useLocale();
  const navItems = useCampmaniaNav();

  return (
    <header className="cm-site-header">
      <div className="cm-site-header-inner">
        {/* Logo */}
        <NavLink prefetch="intent" to="/" className="group min-w-0 shrink-0" end>
          <span className="font-display text-xl tracking-tight text-mist transition group-hover:text-amber sm:text-2xl">
            {tr.brand}
          </span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-sage">
            Tbilisi · Georgia
          </span>
        </NavLink>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-8 lg:flex"
          role="navigation"
          aria-label="Main"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              prefetch="intent"
              className={({isActive}) =>
                `cm-nav-link ${isActive ? 'cm-nav-link-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          <LanguageSwitcher />
          <AccountLink isLoggedIn={isLoggedIn} />
          <SearchToggle />
          <CartToggle cart={cart} />
          <HeaderMenuMobileToggle />
        </div>
      </div>
    </header>
  );
}

export function HeaderMenu({
  viewport,
  isLoggedIn,
}: {
  menu?: HeaderProps['header']['menu'];
  primaryDomainUrl?: string;
  viewport: Viewport;
  publicStoreDomain?: string;
  isLoggedIn?: Promise<boolean>;
}) {
  const {close} = useAside();
  const {translations: tr} = useLocale();
  const navItems = useCampmaniaNav();

  if (viewport === 'desktop') return null;

  return (
    <nav className="cm-mobile-nav" role="navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.to}
          end={item.end}
          onClick={close}
          prefetch="intent"
          className={({isActive}) =>
            `cm-mobile-nav-link ${isActive ? 'cm-mobile-nav-link-active' : ''}`
          }
        >
          {item.label}
        </NavLink>
      ))}
      {isLoggedIn ? (
        <Suspense fallback={null}>
          <Await resolve={isLoggedIn}>
            {(loggedIn) => (
              <NavLink
                to={loggedIn ? '/account' : '/account/login'}
                onClick={close}
                className="cm-mobile-nav-account"
              >
                {loggedIn ? tr.nav.account : tr.nav.signIn}
              </NavLink>
            )}
          </Await>
        </Suspense>
      ) : (
        <NavLink
          to="/account/login"
          onClick={close}
          className="cm-mobile-nav-account"
        >
          {tr.nav.signIn}
        </NavLink>
      )}
    </nav>
  );
}

/** Sign in → Shopify OAuth. Account → dashboard when authenticated. */
function AccountLink({isLoggedIn}: {isLoggedIn: Promise<boolean>}) {
  const {translations: tr} = useLocale();

  return (
    <Suspense
      fallback={
        <span className="hidden text-sm text-sage sm:inline">{tr.nav.signIn}</span>
      }
    >
      <Await resolve={isLoggedIn} errorElement={
        <NavLink
          prefetch="intent"
          to="/account/login"
          className="hidden text-sm font-medium text-sage transition hover:text-mist no-underline hover:no-underline sm:inline"
        >
          {tr.nav.signIn}
        </NavLink>
      }>
        {(loggedIn) => (
          <NavLink
            prefetch="intent"
            to={loggedIn ? '/account' : '/account/login'}
            className="hidden text-sm font-medium text-sage transition hover:text-mist no-underline hover:no-underline sm:inline"
          >
            {loggedIn ? tr.nav.account : tr.nav.signIn}
          </NavLink>
        )}
      </Await>
    </Suspense>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      type="button"
      className="cm-icon-btn lg:hidden"
      onClick={() => open('mobile')}
      aria-label="Open menu"
    >
      <IconMenu size={18} />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  const {translations: tr} = useLocale();
  return (
    <button
      type="button"
      className="cm-icon-btn"
      onClick={() => open('search')}
      aria-label={tr.nav.search}
    >
      <IconSearch size={18} />
    </button>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  const {translations: tr} = useLocale();

  return (
    <button
      type="button"
      className="cm-icon-btn relative"
      aria-label={`${tr.nav.cart} (${count})`}
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <IconBag size={18} />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[10px] font-bold text-pine">
          {count}
        </span>
      ) : null}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}
