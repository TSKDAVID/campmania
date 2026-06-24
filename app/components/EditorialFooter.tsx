import {Link} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';

export function EditorialFooter() {
  const {locale, translations: tr} = useLocale();
  const year = new Date().getFullYear();
  const isKa = locale === 'ka';

  const linkCols = {
    links: [
      {to: '/packages', label: tr.nav.packages},
      {to: '/individual-gear', label: tr.nav.gear},
      {to: '/pages/how-it-works', label: tr.nav.howItWorks},
      {to: '/pages/faq', label: tr.nav.faq},
    ],
    contact: [
      {to: '/pages/contact', label: tr.pages.contact},
      {href: 'mailto:hello@campmania.ge', label: 'hello@campmania.ge'},
      {href: 'tel:+995555000000', label: '+995 555 00 00 00'},
    ],
    social: [
      {href: 'https://instagram.com/campmania', label: 'Instagram'},
    ],
  };

  return (
    <footer className="cm-footer">
      <div className="cm-footer__grid">
        <div>
          <Link to="/" className="cm-wordmark">
            campmania
          </Link>
          <p className="cm-footer__mission">
            {isKa
              ? 'პრემიუმ კემპინგის აღჭურვილობის ქირა საქართველოში.'
              : 'Premium camping gear rental in Georgia.'}
          </p>
        </div>

        <div>
          <p className="cm-footer__col-title">{isKa ? 'ბმულები' : 'Links'}</p>
          <ul className="cm-footer__links">
            {linkCols.links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="cm-footer__link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="cm-footer__col-title">{isKa ? 'კონტაქტი' : 'Contact'}</p>
          <ul className="cm-footer__links">
            {linkCols.contact.map((item) => (
              <li key={item.label}>
                {'href' in item ? (
                  <a href={item.href} className="cm-footer__link">
                    {item.label}
                  </a>
                ) : (
                  <Link to={item.to} className="cm-footer__link">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="cm-footer__col-title">{isKa ? 'სოციალური' : 'Social'}</p>
          <ul className="cm-footer__links">
            {linkCols.social.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="cm-footer__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="cm-footer__copy">
        © {year} campmania
        {isKa ? ' · ყველა უფლება დაცულია' : ' · All rights reserved'}
      </p>
    </footer>
  );
}
