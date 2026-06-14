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
        subtitle={tr.gear.subtitle}
        compact
      />
      <section className="tr-section-tight bg-white">
        <div className="tr-page-width">
          {!shopifyConnected ? (
            <p className="mb-4 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-charcoal/80">
              {tr.gear.shopifySetupHint}
            </p>
          ) : null}
          <GearFiltersBar options={GEAR_FILTERS} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <div className="p-4 md:p-5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-moss">
                      {item.categoryLabel}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-bold text-pine group-hover:text-forest">
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
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                      {item.subtitle}
                    </p>
                    <div className="mt-3 flex items-baseline justify-between border-t border-stone/70 pt-3">
                      <p className="font-display text-xl font-bold text-forest">
                        {item.priceLabel}
                      </p>
                    </div>
                    {productUrl ? (
                      <Link
                        to={productUrl}
                        className="tr-btn-secondary mt-3 flex w-full items-center justify-center gap-2 py-2.5 text-xs"
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
