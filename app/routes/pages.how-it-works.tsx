import type {Route} from './+types/pages.how-it-works';
import {HomeHowItWorks} from '~/components/home/HomeHowItWorks';
import {Button} from '~/components/ui/Button';
import {useLocale} from '~/providers/LocaleProvider';

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | How It Works'},
];

export default function HowItWorksPage() {
  const {translations: tr, locale} = useLocale();
  const isKa = locale === 'ka';

  return (
    <>
      <header className="cm-page-banner">
        <h1 className="cm-page-banner__title">{tr.howItWorks.title}</h1>
        <p className="text-sm text-muted" style={{maxWidth: 'var(--layout-max)', margin: 'var(--space-2) auto 0', padding: '0 var(--gutter-mobile)'}}>
          {isKa
            ? '4 მარტივი ნაბიჯი — მეტროში მიღება, ციფრული ID, 0 ₾ დეპოზიტი.'
            : 'Four simple steps — metro pickup, digital ID, zero deposit.'}
        </p>
      </header>
      <HomeHowItWorks />
      <div className="cm-container" style={{paddingTop: 'var(--space-5)', paddingBottom: 'var(--space-5)', textAlign: 'center'}}>
        <Button to="/packages" variant="outline">
          {tr.hero.ctaPackages}
        </Button>
      </div>
    </>
  );
}
