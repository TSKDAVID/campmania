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
      <section className="tr-section-tight bg-white">
        <div className="tr-page-width max-w-3xl">
          <div className="divide-y divide-stone border-y border-stone">
            {FAQ_ITEMS.map((item) => (
              <details key={item.qEn} className="group py-4">
                <summary className="cursor-pointer list-none font-semibold text-pine marker:content-none">
                  {locale === 'ka' ? item.qKa : item.qEn}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {locale === 'ka' ? item.aKa : item.aEn}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted">
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
