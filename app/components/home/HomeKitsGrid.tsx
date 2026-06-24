import {Await} from 'react-router';
import {Suspense} from 'react';
import {SectionHeading} from '~/components/ui/SectionHeading';
import {ProductCard} from '~/components/ui/ProductCard';
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
        <SectionHeading
          title={isKa ? 'კომპლექტები' : 'the kits'}
          className=""
        />
        <div className="cm-product-grid">
          {packages.length ? (
            packages.map((item, index) => (
              <ProductCard
                key={item.id}
                to={item.url}
                title={item.title}
                imageUrl={item.imageUrl}
                imageAlt={item.imageAlt ?? item.title}
                loading={index < 3 ? 'eager' : 'lazy'}
                ctaLabel={isKa ? 'ქირა' : 'Rent'}
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

export function HomeKitsGridDeferred({
  packagesPromise,
}: {
  packagesPromise: Promise<HomepageFeaturedItem[]>;
}) {
  return (
    <Suspense
      fallback={
        <section className="cm-home-section">
          <div className="cm-container">
            <div className="cm-skeleton cm-skeleton--title" />
          </div>
        </section>
      }
    >
      <Await resolve={packagesPromise}>
        {(packages) => <HomeKitsGrid packages={packages} />}
      </Await>
    </Suspense>
  );
}
