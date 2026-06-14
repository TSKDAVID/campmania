import {useSearchParams} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {GEAR_FILTERS} from '~/lib/trailrent/catalog';
import type {ShopifyGearItem} from '~/lib/trailrent/shopify-catalog';
import {CatalogPageHeading} from '~/components/trailrent/HomeSections';
import {GearFiltersBar} from '~/components/trailrent/CatalogFilters';
import {GearProductCard} from '~/components/trailrent/GearProductCard';

export function GearCatalogGrid({
  gear,
  shopifyConnected,
}: {
  gear: ShopifyGearItem[];
  shopifyConnected?: boolean;
}) {
  const {translations: tr} = useLocale();
  const [params] = useSearchParams();
  const category = params.get('gear') ?? '';

  const filtered = category ? gear.filter((g) => g.category === category) : gear;

  return (
    <>
      <section className="cm-catalog-page bg-white">
        <div className="tr-page-width cm-catalog-page-inner">
          <CatalogPageHeading title={tr.gear.title} />
          {!shopifyConnected ? (
            <p className="mb-4 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-charcoal/80">
              {tr.gear.shopifySetupHint}
            </p>
          ) : null}
          <div className="cm-catalog-filters-sticky">
            <GearFiltersBar options={GEAR_FILTERS} />
          </div>

          <div className="cm-product-grid">
            {filtered.map((item, index) => (
              <GearProductCard
                key={item.id}
                item={item}
                loading={index < 4 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
