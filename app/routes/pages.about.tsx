import type {Route} from './+types/pages.about';
import {useLocale} from '~/providers/LocaleProvider';

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | About'},
];

export default function AboutPage() {
  const {locale} = useLocale();
  const isKa = locale === 'ka';

  return (
    <>
      <header className="cm-page-banner">
        <h1 className="cm-page-banner__title">
          {isKa ? 'ჩვენს შესახებ' : 'About campmania'}
        </h1>
      </header>

      <div className="cm-page-body cm-page-body--columns">
        <div>
          <p className="text-base" style={{lineHeight: 1.8}}>
            {isKa
              ? 'campmania არის პრემიუმ კემპინგის აღჭურვილობის ქირის სერვისი თბილისიდან. ჩვენ გვჯერა, რომ საქართველოს ბუნების გამოცდა არ უნდა იწყებოდეს ძვირადღირებული აღჭურვილობის შეძენით.'
              : 'campmania is a premium camping gear rental service based in Tbilisi. We believe exploring Georgia’s wilderness shouldn’t start with buying expensive equipment.'}
          </p>
          <p className="text-base text-muted" style={{lineHeight: 1.8, marginTop: 'var(--space-3)'}}>
            {isKa
              ? 'ჩვენი კომპლექტები შექმნილია კონკრეტული მარშრუტებისთვის — ტობავარჩხილიდან ყაზბეგამდე. მიიღე მეტროსადგურზე, დააბრუნე იგივე გზით.'
              : 'Our kits are built for specific routes — from Tobavarchkhili to Kazbegi. Pick up at any metro station, return the same way.'}
          </p>
        </div>
        <div>
          <p className="text-base" style={{lineHeight: 1.8}}>
            {isKa
              ? 'ყველა აღჭურვილობა პროფესიონალურად არის დაკონსერვირებული და შემოწმებული ყოველი გაცემის წინ. ჩვენი გუნდი თავად არის მოგზაური — ვიცით რა გჭირდებათ ველში.'
              : 'Every item is professionally maintained and inspected before each rental. Our team are hikers ourselves — we know what you need on the trail.'}
          </p>
        </div>
      </div>

      <div
        className="cm-img-placeholder"
        style={{width: '100%', minHeight: '320px', borderLeft: 'none', borderRight: 'none'}}
        aria-hidden
      />
    </>
  );
}
