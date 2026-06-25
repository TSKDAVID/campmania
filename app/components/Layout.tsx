import {Await} from 'react-router';
import {Suspense} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {EditorialFooter} from '~/components/EditorialFooter';

interface LayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children: React.ReactNode;
}

export function Layout({
  cart,
  footer: _footer,
  header,
  isLoggedIn,
  publicStoreDomain,
  children,
}: LayoutProps) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <MobileMenuAside
        header={header}
        publicStoreDomain={publicStoreDomain}
        isLoggedIn={isLoggedIn}
      />
      <div className="cm-site-shell">
        <div className="cm-site-top">
          <Header
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
          />
        </div>
        <main className="cm-main cm-editorial" id="main-content">
          {children}
        </main>
        <EditorialFooter />
      </div>
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: LayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<p>Loading cart…</p>}>
        <Await resolve={cart}>
          {(resolvedCart) => <CartMain cart={resolvedCart} layout="aside" />}
        </Await>
      </Suspense>
    </Aside>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
  isLoggedIn,
}: Pick<LayoutProps, 'header' | 'publicStoreDomain' | 'isLoggedIn'>) {
  return (
    <Aside type="mobile" heading="MENU">
      <HeaderMenu
        menu={header.menu}
        viewport="mobile"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
        isLoggedIn={isLoggedIn}
      />
    </Aside>
  );
}
