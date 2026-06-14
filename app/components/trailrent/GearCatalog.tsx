import {Link, useSearchParams} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {GEAR_FILTERS} from '~/lib/trailrent/catalog';
import type {ShopifyGearItem} from '~/lib/trailrent/shopify-catalog';
import {PageBanner} from '~/components/trailrent/HomeSections';
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
      <PageBanner
        eyebrow={tr.gear.eyebrow}
        title={tr.gear.title}
        compact
      />
      <section className="tr-section-tight bg-white">
        <div className="tr-page-width">
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

              return (
                <article key={item.id} className="cm-kit-card group">
                  <Link
                    to={productUrl ?? '#'}
                    className="cm-kit-card-media relative block overflow-hidden bg-stone no-underline hover:no-underline"
                  >
                    {item.imageUrl ? (
                      <CatalogCardImage
                        src={item.imageUrl}
                        alt={item.imageAlt ?? item.title}
                      />
                    ) : (
                      <div className="cm-kit-card-pattern absolute inset-0 bg-gradient-to-br from-stone via-mist to-sage/20 opacity-80" />
                    )}
                  </Link>
                  <div className="cm-kit-card-body">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-moss sm:text-[11px]">
                      {item.categoryLabel}
                    </span>
                    <h3 className="cm-kit-card-title mt-1 font-display font-bold text-pine group-hover:text-forest">
                      {productUrl ? (
                        <Link
                          to={productUrl}
                          className="no-underline hover:no-underline"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted sm:text-sm">
                      {item.subtitle}
                    </p>
                    <div className="mt-3 flex items-baseline justify-between border-t border-stone/70 pt-3">
                      <p className="font-display text-lg font-bold text-forest sm:text-xl">
                        {item.priceLabel}
                      </p>
                    </div>
                    {productUrl ? (
                      <Link
                        to={productUrl}
                        className="tr-btn-secondary cm-kit-card-cta mt-2 flex w-full items-center justify-center gap-2 py-2 text-xs sm:mt-3"
                      >
                        {tr.gear.viewAndBook}
                        <IconArrowRight size={14} />
                      </Link>
                    ) : (
                      <span className="mt-3 block text-center text-xs text-muted">
                        Shopify product pending
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
