import {Button} from '~/components/ui/Button';
import {SectionHeading} from '~/components/ui/SectionHeading';
import {useLocale} from '~/providers/LocaleProvider';

const ROUTES = [
  {
    name: 'Tobavarchkhili',
    kitHandle: 'tobavarchkhili-weekend-kit',
    kitKa: 'ტობავარჩხილის კომპლექტი',
    kitEn: 'Tobavarchkhili weekend kit',
  },
  {
    name: 'Kazbegi',
    kitHandle: 'kazbegi-alpine-kit',
    kitKa: 'ყაზბეგის ალპური კომპლექტი',
    kitEn: 'Kazbegi alpine kit',
  },
  {
    name: 'Birtvisi',
    kitHandle: 'birtvisi-day-hike-kit',
    kitKa: 'ბირთვისის დღიური კომპლექტი',
    kitEn: 'Birtvisi day hike kit',
  },
];

export function HomeFeaturedRoutes() {
  const {locale} = useLocale();
  const isKa = locale === 'ka';

  return (
    <section className="cm-home-section" aria-labelledby="home-routes-heading">
      <div className="cm-container">
        <SectionHeading
          title={isKa ? 'რეკომენდებული მარშრუტები' : 'Featured routes'}
        />
        <div className="cm-routes-scroll">
          {ROUTES.map((route) => (
            <article key={route.name} className="cm-product-card">
              <div className="cm-img-placeholder" aria-hidden />
              <div className="cm-product-card__body">
                <h3 className="cm-product-card__title">{route.name}</h3>
                <p className="cm-product-card__price">
                  {isKa ? route.kitKa : route.kitEn}
                </p>
                <div className="cm-product-card__cta">
                  <Button
                    to={`/products/${route.kitHandle}`}
                    variant="outline"
                    fullWidth
                  >
                    {isKa ? 'ნახე კომპლექტი' : 'see kit'}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
