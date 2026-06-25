import type {Route} from './+types/pages.contact';
import {PageBanner} from '~/components/trailrent/HomeSections';
import {useLocale} from '~/providers/LocaleProvider';

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Contact'},
];

export default function ContactPage() {
  const {locale} = useLocale();

  return (
    <>
      <PageBanner
        eyebrow={locale === 'ka' ? 'კონტაქტი' : 'Contact'}
        title={locale === 'ka' ? 'დაგვიკავშირდით' : 'Get in touch'}
        subtitle={
          locale === 'ka'
            ? 'კითხვები ქირაზე, მეტრო hub-ზე მიღებაზე ან Trusted Tier-ზე.'
            : 'Questions about rentals, metro pickup, or Trusted Tier.'
        }
        compact
      />
      <section className="cm-content-section">
        <div className="max-w-xl">
          <div className="cm-contact-card">
            <p className="cm-contact-card__label">
              {locale === 'ka' ? 'ელფოსტა' : 'Email'}
            </p>
            <a href="mailto:hello@campmania.ge" className="cm-contact-card__mail">
              hello@campmania.ge
            </a>
            <p className="cm-doc-lead mt-4">
              {locale === 'ka'
                ? 'პასუხს ჩვეულებრივ 24 საათში გიგზავნით. დაჯავშნისას მეტრო სადგურს პირდაპირ ფორმაში ირჩევთ.'
                : 'We usually reply within 24 hours. Pick your metro station directly in the booking form.'}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
