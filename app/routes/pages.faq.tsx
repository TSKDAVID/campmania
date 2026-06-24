import {Link} from 'react-router';
import type {Route} from './+types/pages.faq';
import {FAQ_ITEMS} from '~/lib/trailrent/faq-content';
import {useLocale} from '~/providers/LocaleProvider';

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | FAQ'},
];

export default function FaqPage() {
  const {translations: tr, locale} = useLocale();
  const isKa = locale === 'ka';

  return (
    <>
      <header className="cm-page-banner">
        <h1 className="cm-page-banner__title">{tr.faq.title}</h1>
      </header>
      <div className="cm-page-body cm-page-body--narrow">
        {FAQ_ITEMS.map((item) => (
          <div key={item.qEn} className="cm-faq-item">
            <h2 className="cm-faq-item__q">{isKa ? item.qKa : item.qEn}</h2>
            <p className="cm-faq-item__a">{isKa ? item.aKa : item.aEn}</p>
          </div>
        ))}
        <p className="text-sm text-muted" style={{marginTop: 'var(--space-4)'}}>
          {isKa ? 'კიდევ კითხვა?' : 'Still have questions?'}{' '}
          <Link to="/pages/contact" style={{color: 'var(--color-accent)'}}>
            {isKa ? 'დაგვიკავშირდით' : 'Contact us'}
          </Link>
        </p>
      </div>
    </>
  );
}
