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
        <div className="grid gap-2">
          <Link to="/" className="cm-editorial-footer__brand">
            {tr.brand}
          </Link>
          <p className="cm-doc-meta">
            {locale === 'ka'
              ? 'პრემიუმ სალაშქრო აღჭურვილობის გაქირავება საქართველოში.'
              : 'Premium trail gear rental service in Georgia.'}
          </p>
          <p className="cm-editorial-footer__copy mt-2">
            © {year} {tr.brand}
            {locale === 'ka' ? ' · ყველა უფლება დაცულია' : ' · All rights reserved'}
          </p>
        </div>

        <nav aria-label={locale === 'ka' ? 'საიტის ბმულები' : 'Site links'} className="grid gap-3">
          <ul className="cm-editorial-footer__nav">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="cm-editorial-footer__link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/pages/how-it-works" className="cm-editorial-footer__link">
            {locale === 'ka' ? 'როგორ მუშაობს' : 'How it works'}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
