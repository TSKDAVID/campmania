import {useMemo} from 'react';
import {useSearchParams} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {buildGearFilterOptionsFromCatalog} from '~/lib/trailrent/catalog';
import type {ShopifyGearItem} from '~/lib/trailrent/shopify-catalog';
import {CatalogPageHeading} from '~/components/trailrent/HomeSections';
import {CatalogProductCard} from '~/components/trailrent/CatalogProductCard';
import {GearFiltersBar} from '~/components/trailrent/CatalogFilters';
import {PriceWithCompare} from '~/components/trailrent/PriceWithCompare';

export function GearCatalogGrid({
  gear,
  shopifyConnected,
}: {
  gear: ShopifyGearItem[];
  shopifyConnected?: boolean;
}) {
  const {translations: tr, locale} = useLocale();
  const [params] = useSearchParams();
  const category = params.get('gear') ?? '';

  const filterOptions = useMemo(
    () => buildGearFilterOptionsFromCatalog(gear),
    [gear],
  );

  const filtered = category ? gear.filter((g) => g.category === category) : gear;

  return (
    <section className="cm-catalog-page bg-white">
      <div className="tr-page-width cm-catalog-page-intro">
        <CatalogPageHeading title={tr.gear.title} />
        {!shopifyConnected ? (
          <p className="cm-catalog-hint">
            {tr.gear.shopifySetupHint}
          </p>
        ) : null}
      </div>

      <div className="cm-catalog-filters-sticky">
        <div className="tr-page-width">
          <GearFiltersBar options={filterOptions} />
        </div>
      </div>

      <div className="tr-page-width cm-catalog-page-body">
        <div className="cm-catalog-grid cm-catalog-grid--gear">
          {filtered.map((item, index) => (
            <CatalogProductCard
              key={item.id}
              to={
                item.productHandle ? `/products/${item.productHandle}` : null
              }
              title={item.title}
              imageUrl={item.imageUrl}
              imageUrls={item.imageUrls}
              imageAlt={item.imageAlt}
              price={
                <PriceWithCompare
                  amount={item.dailyRate}
                  compareAtAmount={item.compareAtPrice}
                  suffix={` / ${locale === 'ka' ? 'დღე' : 'day'}`}
                />
              }
              loading={index < 4 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
