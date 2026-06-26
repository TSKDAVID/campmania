import {Link} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';

export function EditorialFooter() {
  const {translations: tr} = useLocale();
  const year = new Date().getFullYear();
  const ft = tr.footer;

  return (
    <footer className="cm-editorial-footer">
      <div className="tr-page-width cm-editorial-footer__inner">
        <ul className="cm-editorial-footer__services">
          <li>{ft.serviceGear}</li>
          <li>{ft.serviceMetro}</li>
          <li>{ft.serviceDelivery}</li>
        </ul>

        <div className="cm-editorial-footer__grid">
          <div className="cm-editorial-footer__brand-col">
            <Link to="/" className="cm-editorial-footer__brand">
              {tr.brand}
            </Link>
            <p className="cm-editorial-footer__tagline">{ft.tagline}</p>
          </div>

          <div className="cm-editorial-footer__col">
            <h4>{ft.rent}</h4>
            <ul>
              <li>
                <Link to="/packages">{tr.nav.packages}</Link>
              </li>
              <li>
                <Link to="/individual-gear">{tr.nav.gear}</Link>
              </li>
              <li>
                <Link to="/gear-builder">{tr.nav.gearBuilder}</Link>
              </li>
            </ul>
          </div>

          <div className="cm-editorial-footer__col">
            <h4>{ft.support}</h4>
            <ul>
              <li>
                <Link to="/pages/how-it-works">{tr.pages.howItWorks}</Link>
              </li>
              <li>
                <Link to="/pages/faq">{tr.pages.faq}</Link>
              </li>
              <li>
                <Link to="/pages/contact">{tr.pages.contact}</Link>
              </li>
              <li>
                <Link to="/account">{tr.nav.account}</Link>
              </li>
            </ul>
          </div>

          <div className="cm-editorial-footer__col">
            <h4>{ft.contact}</h4>
            <ul>
              <li className="cm-editorial-footer__meta">{ft.location}</li>
              <li className="cm-editorial-footer__meta">{ft.hours}</li>
              <li>
                <a href="mailto:hello@campmania.ge">hello@campmania.ge</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="cm-editorial-footer__fine-print">
          <p className="cm-editorial-footer__copy">
            © {year} {tr.brand} — {ft.rights}
          </p>
          <nav aria-label={ft.legal}>
            <Link to="/policies/terms-of-service">{ft.terms}</Link>
            <Link to="/policies/privacy-policy">{ft.privacy}</Link>
            <Link to="/policies/refund-policy">{ft.returns}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
