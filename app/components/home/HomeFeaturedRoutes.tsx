import {SectionHeading} from '~/components/ui/SectionHeading';
import {CatalogProductCard} from '~/components/trailrent/CatalogProductCard';
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
    kitHandle: 'birtvisi-package',
    altHandle: 'birtvisi-day-hike-kit',
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
        <div className="cm-routes-scroll cm-catalog-grid--packages">
          {ROUTES.map((route) => (
            <CatalogProductCard
              key={route.name}
              to={`/products/${route.kitHandle}`}
              title={route.name}
              imageUrl={null}
              variant="package"
              price={
                <span className="text-sm text-muted">
                  {isKa ? route.kitKa : route.kitEn}
                </span>
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
