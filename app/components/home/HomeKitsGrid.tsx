import {SectionHeading} from '~/components/ui/SectionHeading';
import {CatalogProductCard} from '~/components/trailrent/CatalogProductCard';
import {PriceWithCompare} from '~/components/trailrent/PriceWithCompare';
import {useLocale} from '~/providers/LocaleProvider';
import type {HomepageFeaturedItem} from '~/lib/trailrent/shopify-catalog';

export function HomeKitsGrid({
  packages,
}: {
  packages: HomepageFeaturedItem[];
}) {
  const {locale} = useLocale();
  const isKa = locale === 'ka';
  const perDay = isKa ? '/ დღე' : '/ day';

  return (
    <section className="cm-home-section" aria-labelledby="home-kits-heading">
      <div className="cm-container">
        <SectionHeading title={isKa ? 'კომპლექტები' : 'the kits'} />
        <div className="cm-product-grid cm-catalog-grid--packages">
          {packages.length ? (
            packages.map((item, index) => (
              <CatalogProductCard
                key={item.id}
                to={item.url}
                title={item.title}
                imageUrl={item.imageUrl}
                imageUrls={item.imageUrls}
                imageAlt={item.imageAlt ?? item.title}
                loading={index < 3 ? 'eager' : 'lazy'}
                variant="package"
                price={
                  item.dailyRate > 0 ? (
                    <PriceWithCompare
                      amount={item.dailyRate}
                      compareAtAmount={item.compareAt}
                      suffix={` ${perDay}`}
                    />
                  ) : null
                }
              />
            ))
          ) : (
            <p className="text-muted text-sm">
              {isKa ? 'კომპლექტები მალე გამოჩნდება.' : 'Kits coming soon.'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
