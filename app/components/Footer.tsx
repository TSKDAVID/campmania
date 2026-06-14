import {Suspense} from 'react';
import {Await, Link, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {useLocale} from '~/providers/LocaleProvider';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
}: FooterProps) {
  const {translations: tr, locale} = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="cm-site-footer">
      <div className="tr-page-width tr-section-tight">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl text-mist">{tr.brand}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-sage">
              {tr.tagline}
            </p>
            <p className="mt-4 text-xs text-sage/80">{tr.footer.hours}</p>
          </div>

          {/* Rent */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-mist">
              {tr.footer.rent}
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/packages" className="cm-footer-link">
                  {tr.nav.packages}
                </Link>
              </li>
              <li>
                <Link to="/individual-gear" className="cm-footer-link">
                  {tr.nav.gear}
                </Link>
              </li>
              <li>
                <Link to="/collections/all" className="cm-footer-link">
                  {locale === 'ka' ? 'Shopify კატალოგი' : 'Shop catalog'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-mist">
              {tr.footer.support}
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/pages/how-it-works" className="cm-footer-link">
                  {tr.pages.howItWorks}
                </Link>
              </li>
              <li>
                <Link to="/pages/faq" className="cm-footer-link">
                  {tr.pages.faq}
                </Link>
              </li>
              <li>
                <Link to="/pages/contact" className="cm-footer-link">
                  {tr.pages.contact}
                </Link>
              </li>
              <li>
                <Link to="/account" className="cm-footer-link">
                  {tr.nav.account}
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-mist">
              {locale === 'ka' ? 'იურიდიული' : 'Legal'}
            </h3>
            <Suspense fallback={<PolicyLinksFallback />}>
              <Await resolve={footerPromise}>
                {(footer) => <PolicyLinks menu={footer?.menu ?? null} />}
              </Await>
            </Suspense>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-sage/70 md:flex-row">
          <p>
            © {year} {tr.brand}.{' '}
            {locale === 'ka'
              ? 'ყველა უფლება დაცულია.'
              : 'All rights reserved.'}
          </p>
          <p>
            {locale === 'ka'
              ? 'პრემიუმ ლაშქრობის აღჭურვილობის ქირა · თბილისი, საქართველო'
              : 'Premium hiking gear rental · Tbilisi, Georgia'}
          </p>
        </div>
      </div>
    </footer>
  );
}

const POLICY_LINKS = [
  {id: 'privacy', href: '/policies/privacy-policy', label: 'Privacy Policy'},
  {id: 'terms', href: '/policies/terms-of-service', label: 'Terms of Service'},
  {id: 'refund', href: '/policies/refund-policy', label: 'Refund Policy'},
  {id: 'shipping', href: '/policies/shipping-policy', label: 'Shipping Policy'},
];

function PolicyLinksFallback() {
  return (
    <ul className="mt-4 space-y-2.5">
      {POLICY_LINKS.map((item) => (
        <li key={item.id}>
          <NavLink to={item.href} className="cm-footer-link">
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function PolicyLinks({menu}: {menu: FooterQuery['menu'] | null}) {
  const items = menu?.items?.length
    ? menu.items.filter((i) => i.url)
    : POLICY_LINKS.map((p) => ({
        id: p.id,
        url: p.href,
        title: p.label,
      }));

  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item) => (
        <li key={item.id}>
          <NavLink to={item.url!} className="cm-footer-link">
            {item.title}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
