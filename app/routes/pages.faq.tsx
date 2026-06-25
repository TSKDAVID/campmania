import {Link} from 'react-router';
import type {Route} from './+types/pages.faq';
import {PageBanner} from '~/components/trailrent/HomeSections';
import {FAQ_ITEMS} from '~/lib/trailrent/faq-content';
import {useLocale} from '~/providers/LocaleProvider';

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | FAQ'},
];

export default function FaqPage() {
  const {translations: tr, locale} = useLocale();

  return (
    <>
      <PageBanner
        eyebrow={tr.faq.eyebrow}
        title={tr.faq.title}
        subtitle={
          locale === 'ka'
            ? 'ყველაფერი ქირაზე, მეტრო hub-ზე მიღებაზე და Trusted Tier-ზე.'
            : 'Everything about rentals, metro pickup, and Trusted Tier.'
        }
        compact
      />
      <section className="cm-content-section">
        <div className="max-w-3xl">
          <div className="cm-faq-list">
            {FAQ_ITEMS.map((item) => (
              <details key={item.qEn} className="cm-faq-item">
                <summary>
                  {locale === 'ka' ? item.qKa : item.qEn}
                </summary>
                <p>
                  {locale === 'ka' ? item.aKa : item.aEn}
                </p>
              </details>
            ))}
          </div>
          <p className="cm-doc-meta mt-4">
            {locale === 'ka' ? 'კიდევ კითხვა?' : 'Still have questions?'}{' '}
            <Link to="/pages/contact" className="cm-link font-semibold">
              {locale === 'ka' ? 'დაგვიკავშირდით' : 'Contact us'}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
