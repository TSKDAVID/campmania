import {Link} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';

export function EditorialFooter() {
  const {locale, translations: tr} = useLocale();
  const year = new Date().getFullYear();

  const links = [
    {to: '/pages/contact', label: tr.pages.contact},
    {to: '/pages/faq', label: tr.pages.faq},
    {to: '/policies/terms-of-service', label: locale === 'ka' ? 'წესები' : 'Terms'},
  ];

  return (
    <footer className="cm-editorial-footer">
      <div className="cm-editorial-footer__inner">
        <div>
          <Link to="/" className="cm-editorial-footer__brand">
            {tr.brand}
          </Link>
          <p className="cm-editorial-footer__copy mt-2">
            © {year} {tr.brand}
            {locale === 'ka' ? ' · ყველა უფლება დაცულია' : ' · All rights reserved'}
          </p>
        </div>

        <nav aria-label={locale === 'ka' ? 'საიტის ბმულები' : 'Site links'}>
          <ul className="cm-editorial-footer__nav">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="cm-editorial-footer__link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
