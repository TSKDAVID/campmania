import {Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

const useIsomorphicLayoutEffect =
  typeof document !== 'undefined' ? useLayoutEffect : useEffect;
import {Await, Form, NavLink, useAsyncValue, useLocation} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {LanguageSwitcher} from '~/components/trailrent/HomeSections';
import {IconBag, IconMenu, IconSearch, IconX} from '~/components/trailrent/Icons';
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

/** Campmania primary navigation — always use branded routes, not Shopify default menu. */
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

function isNavItemActive(item: NavItem, pathname: string) {
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function HeaderDesktopNav({items}: {items: NavItem[]}) {
  const {translations: tr} = useLocale();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreMeasureRef = useRef<HTMLSpanElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [menuOpen, setMenuOpen] = useState(false);
  const navGap = 5;

  const recalculateVisibleCount = useCallback(() => {
    const nav = navRef.current;
    const measure = measureRef.current;
    const moreMeasure = moreMeasureRef.current;
    if (!nav || !measure) return;

    const available = nav.clientWidth;
    if (!available) return;

    const itemEls = measure.querySelectorAll<HTMLElement>('[data-nav-measure]');
    const widths = Array.from(itemEls, (element) => element.offsetWidth);
    const moreWidth = moreMeasure?.offsetWidth ?? 72;
    const totalWidth =
      widths.reduce((sum, width) => sum + width, 0) +
      Math.max(0, widths.length - 1) * navGap;

    if (totalWidth <= available) {
      setVisibleCount(items.length);
      return;
    }

    let used = 0;
    let count = 0;

    for (let index = 0; index < widths.length; index++) {
      const itemGap = index > 0 ? navGap : 0;
      const remainingAfter = widths.length - index - 1;
      const reserveMore = remainingAfter > 0 ? navGap + moreWidth : 0;
      const nextUsed = used + itemGap + widths[index];

      if (nextUsed + reserveMore > available) {
        count = index;
        break;
      }

      used = nextUsed;
      count = index + 1;
    }

    setVisibleCount(Math.max(0, Math.min(count, items.length)));
  }, [items, navGap]);

  useIsomorphicLayoutEffect(() => {
    recalculateVisibleCount();
  }, [recalculateVisibleCount, tr]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    const observer = new ResizeObserver(() => recalculateVisibleCount());
    observer.observe(nav);
    window.addEventListener('resize', recalculateVisibleCount);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', recalculateVisibleCount);
    };
  }, [recalculateVisibleCount]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onPointerDown = (event: PointerEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen]);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);
  const overflowHasActive = overflowItems.some((item) =>
    isNavItemActive(item, location.pathname),
  );
  const moreLabel = tr.nav.more;

  return (
    <nav
      ref={navRef}
      className="cm-site-nav cm-site-header-nav hidden lg:flex"
      role="navigation"
      aria-label="Main"
    >
      <div ref={measureRef} className="cm-site-header-nav__measure" aria-hidden>
        {items.map((item) => (
          <span key={item.id} data-nav-measure className="cm-nav-link">
            {item.label}
          </span>
        ))}
        <span
          ref={moreMeasureRef}
          data-nav-more
          className="cm-nav-link cm-nav-more-btn"
        >
          {moreLabel}
        </span>
      </div>

      <div className="cm-site-header-nav__visible">
        {visibleItems.map((item) => (
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

        {overflowItems.length > 0 ? (
          <div className="cm-nav-more" ref={moreRef}>
            <button
              type="button"
              className={`cm-nav-link cm-nav-more-btn${
                overflowHasActive ? ' cm-nav-link-active' : ''
              }`}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {moreLabel}
            </button>

            {menuOpen ? (
              <div className="cm-nav-more__menu" role="menu">
                {overflowItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    end={item.end}
                    prefetch="intent"
                    role="menuitem"
                    className={({isActive}) =>
                      `cm-nav-link cm-nav-more__link ${
                        isActive ? 'cm-nav-link-active' : ''
                      }`
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export function Header({
  isLoggedIn,
  cart,
}: HeaderProps) {
  const {translations: tr} = useLocale();
  const navItems = useCampmaniaNav();

  return (
    <header className="cm-site-header">
      <div className="cm-site-header-grid tr-page-width">
        <div className="cm-site-header-main-row">
          <div className="cm-site-header-brand-cell">
            <NavLink prefetch="intent" to="/" className="cm-brand-block" end>
              <span className="cm-brand-logotype">{tr.brand}</span>
            </NavLink>
          </div>

          <HeaderDesktopNav items={navItems} />

          <div className="cm-site-header-end">
            <div className="cm-site-header-search-cell">
              <HeaderSearch />
            </div>
            <div className="cm-site-header-actions">
              <LanguageSwitcher />
              <AccountLink isLoggedIn={isLoggedIn} />
              <CartToggle cart={cart} />
              <HeaderMenuMobileToggle />
            </div>
          </div>
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
    <nav className="cm-mobile-nav" id="cm-mobile-nav" role="navigation">
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
          className="cm-account-link"
        >
          {tr.nav.signIn}
        </NavLink>
      }>
        {(loggedIn) => (
          <NavLink
            prefetch="intent"
            to={loggedIn ? '/account' : '/account/login'}
            className="cm-account-link"
          >
            {loggedIn ? tr.nav.account : tr.nav.signIn}
          </NavLink>
        )}
      </Await>
    </Suspense>
  );
}

function HeaderSearch() {
  const {translations: tr} = useLocale();

  return (
    <Form
      method="get"
      action="/search"
      className="cm-header-search"
      role="search"
    >
      <label className="sr-only" htmlFor="header-search-input">
        {tr.nav.search}
      </label>
      <span className="cm-header-search__icon" aria-hidden>
        <IconSearch size={17} />
      </span>
      <input
        id="header-search-input"
        type="search"
        name="q"
        className="cm-header-search__input"
        placeholder={tr.home.searchPlaceholder}
        autoComplete="off"
      />
    </Form>
  );
}

function HeaderMenuMobileToggle() {
  const {type, open, close} = useAside();
  const {translations: tr} = useLocale();
  const isOpen = type === 'mobile';

  return (
    <button
      type="button"
      className={`cm-icon-btn lg:hidden${isOpen ? ' cm-icon-btn--menu-open' : ''}`}
      onClick={() => (isOpen ? close() : open('mobile'))}
      aria-label={isOpen ? tr.nav.closeMenu : tr.nav.openMenu}
      aria-expanded={isOpen}
      aria-controls="cm-mobile-nav"
    >
      {isOpen ? <IconX size={18} /> : <IconMenu size={18} />}
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
        <span className="cm-cart-badge-count absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center px-1 text-[10px] font-bold text-pine">
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
  return (
    <CartBadge count={countVisibleCartLines(cart?.lines?.nodes)} />
  );
}
