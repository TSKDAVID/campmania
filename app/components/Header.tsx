import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {LanguageSwitcher} from '~/components/LanguageSwitcher';
import {IconBag, IconMenu} from '~/components/trailrent/Icons';
import {useLocale} from '~/providers/LocaleProvider';
import {countVisibleCartLines} from '~/lib/trailrent/cart-display';

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

function useCampmaniaNav(): NavItem[] {
  const {translations: tr} = useLocale();
  return [
    {id: 'home', to: '/', label: tr.nav.home, end: true},
    {id: 'packages', to: '/packages', label: tr.nav.packages},
    {id: 'gear', to: '/individual-gear', label: tr.nav.gear},
    {id: 'builder', to: '/gear-builder', label: tr.nav.gearBuilder},
    {id: 'how', to: '/pages/how-it-works', label: tr.nav.howItWorks},
    {id: 'faq', to: '/pages/faq', label: tr.nav.faq},
  ];
}

export function Header({isLoggedIn, cart}: HeaderProps) {
  const navItems = useCampmaniaNav();

  return (
    <header className="cm-site-header">
      <div className="cm-site-header-inner">
        <NavLink prefetch="intent" to="/" className="cm-wordmark" end>
          campmania
        </NavLink>

        <nav className="cm-site-nav" role="navigation" aria-label="Main">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              prefetch="intent"
              className={({isActive}) =>
                `cm-nav-link${isActive ? ' cm-nav-link-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="cm-header-actions">
          <LanguageSwitcher />
          <AccountLink isLoggedIn={isLoggedIn} />
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
            `cm-mobile-nav-link${isActive ? ' cm-mobile-nav-link-active' : ''}`
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

function AccountLink({isLoggedIn}: {isLoggedIn: Promise<boolean>}) {
  const {translations: tr} = useLocale();

  return (
    <Suspense fallback={<span className="cm-header-account">{tr.nav.signIn}</span>}>
      <Await
        resolve={isLoggedIn}
        errorElement={
          <NavLink prefetch="intent" to="/account/login" className="cm-header-account">
            {tr.nav.signIn}
          </NavLink>
        }
      >
        {(loggedIn) => (
          <NavLink
            prefetch="intent"
            to={loggedIn ? '/account' : '/account/login'}
            className="cm-header-account"
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
      <IconMenu size={20} />
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
      <IconBag size={20} />
      {count > 0 ? (
        <span className="cm-cart-count">{count}</span>
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
  return <CartBadge count={countVisibleCartLines(cart?.lines?.nodes)} />;
}
