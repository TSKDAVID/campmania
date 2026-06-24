import {Link} from 'react-router';
import type {Route} from './+types/pages.how-it-works';
import {HowItWorksSection, WhyUsSection} from '~/components/trailrent/ContentSections';
import {PageBanner} from '~/components/trailrent/HomeSections';
import {useLocale} from '~/providers/LocaleProvider';

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | How It Works'},
];

export default function HowItWorksPage() {
  const {translations: tr, locale} = useLocale();

  return (
    <>
      <PageBanner
        eyebrow={tr.howItWorks.eyebrow}
        title={tr.howItWorks.title}
        subtitle={
          locale === 'ka'
            ? '4 მარტივი ნაბიჯი — მეტროში მიღება, ციფრული ID, 0 ₾ დეპოზიტი.'
            : 'Four simple steps — metro pickup, digital ID, zero deposit.'
        }
        compact
      />
      <HowItWorksSection />
      <WhyUsSection />
      <section className="tr-section-tight bg-mist">
        <div className="tr-page-width text-center">
          <Link to="/packages" className="tr-btn-primary">
            {tr.hero.ctaPackages}
          </Link>
        </div>
      </section>
    </>
  );
}
