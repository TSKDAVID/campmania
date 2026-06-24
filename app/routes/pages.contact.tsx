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
      <section className="tr-section-tight bg-white">
        <div className="tr-page-width max-w-xl">
          <div className="rounded-xl border border-stone/70 bg-mist/40 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-moss">
              {locale === 'ka' ? 'ელფოსტა' : 'Email'}
            </p>
            <a href="mailto:hello@campmania.ge" className="cm-link mt-2 inline-block text-lg font-semibold">
              hello@campmania.ge
            </a>
            <p className="mt-6 text-sm leading-relaxed text-muted">
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
