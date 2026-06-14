import {Link, useSearchParams} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {GEAR_FILTERS} from '~/lib/trailrent/catalog';
import type {ShopifyGearItem} from '~/lib/trailrent/shopify-catalog';
import {CatalogPageHeading} from '~/components/trailrent/HomeSections';
import {GearFiltersBar} from '~/components/trailrent/CatalogFilters';
import {CatalogCardImage} from '~/components/trailrent/CatalogCardImage';
import {IconArrowRight} from '~/components/trailrent/Icons';

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

          <div className="cm-catalog-grid cm-catalog-grid--gear">
            {filtered.map((item) => {
              const productUrl = item.productHandle
                ? `/products/${item.productHandle}`
                : null;

              const inner = (
                <>
                  <div className="cm-kit-card-media relative overflow-hidden">
                    {item.imageUrl ? (
                      <CatalogCardImage
                        src={item.imageUrl}
                        alt={item.imageAlt ?? item.title}
                        fit="contain"
                      />
                    ) : (
                      <div className="cm-kit-card-pattern absolute inset-0 bg-gradient-to-br from-stone via-mist to-sage/20 opacity-80" />
                    )}
                  </div>
                  <div className="cm-kit-card-body">
                    <h3 className="cm-kit-card-title">{item.title}</h3>
                    <div className="cm-kit-card-footer">
                      <p className="cm-kit-card-price">{item.priceLabel}</p>
                      <span className="cm-kit-card-arrow" aria-hidden>
                        <IconArrowRight size={18} />
                      </span>
                    </div>
                  </div>
                </>
              );

              if (!productUrl) {
                return (
                  <article key={item.id} className="cm-kit-card">
                    {inner}
                  </article>
                );
              }

              return (
                <article key={item.id} className="cm-kit-card group">
                  <Link
                    to={productUrl}
                    className="cm-kit-card-link no-underline hover:no-underline"
                    prefetch="intent"
                  >
                    {inner}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
