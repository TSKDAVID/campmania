import {Link} from 'react-router';
import {useSearchParams} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {
  DIFFICULTY_FILTERS,
  DURATION_FILTERS,
  TREK_FILTERS,
} from '~/lib/trailrent/catalog';
import type {ShopifyPackageItem} from '~/lib/trailrent/shopify-catalog';
import {CatalogPageHeading} from '~/components/trailrent/HomeSections';
import {
  buildPackageFilterGroups,
  PackageFiltersPanel,
} from '~/components/trailrent/CatalogFilters';
import {CatalogCardImage} from '~/components/trailrent/CatalogCardImage';
import {IconArrowRight, IconMountain} from '~/components/trailrent/Icons';

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-moss/15 text-moss border-moss/25',
  moderate: 'bg-amber/15 text-forest border-amber/30',
  hard: 'bg-pine/10 text-pine border-pine/20',
};

function PackageCard({
  pkg,
  itemsCountLabel,
  savingsLabel,
}: {
  pkg: ShopifyPackageItem;
  itemsCountLabel: string;
  savingsLabel?: string;
}) {
  const diffStyle = DIFFICULTY_STYLES[pkg.difficulty] ?? 'bg-stone text-muted';
  const productUrl = pkg.productHandle ? `/products/${pkg.productHandle}` : null;

  const inner = (
    <>
      <div className="cm-kit-card-media relative overflow-hidden bg-stone">
        {pkg.imageUrl ? (
          <CatalogCardImage
            src={pkg.imageUrl}
            alt={pkg.imageAlt ?? pkg.title}
            fit="contain"
          />
        ) : (
          <>
            <div className="cm-kit-card-pattern absolute inset-0 bg-gradient-to-br from-forest/80 to-moss/40 opacity-80" />
            <IconMountain
              size={32}
              className="relative z-[1] mx-auto text-white/40"
            />
          </>
        )}
        <span
          className={`cm-kit-card-badge absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${diffStyle}`}
        >
          {pkg.difficultyLabel}
        </span>
        {pkg.savingsPercent ? (
          <span className="cm-kit-card-badge absolute left-2 top-2 rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold text-pine">
            -{pkg.savingsPercent}%
          </span>
        ) : null}
      </div>

      <div className="cm-kit-card-body">
        <div className="cm-kit-card-meta">
          <span>{pkg.trekLabel}</span>
          <span aria-hidden>·</span>
          <span>{pkg.durationLabel}</span>
        </div>

        <h3 className="cm-kit-card-title">{pkg.title}</h3>

        <div className="cm-kit-card-footer">
          <div className="min-w-0">
            <p className="cm-kit-card-price">{pkg.priceLabel}</p>
            {pkg.compareAtPrice ? (
              <p className="cm-kit-card-compare">
                <span className="sr-only">{savingsLabel}</span>
                ₾{pkg.compareAtPrice}
              </p>
            ) : null}
            {pkg.items.length > 0 ? (
              <p className="cm-kit-card-count">
                {pkg.items.length} {itemsCountLabel}
              </p>
            ) : null}
          </div>
          <span className="cm-kit-card-arrow" aria-hidden>
            <IconArrowRight size={18} />
          </span>
        </div>
      </div>
    </>
  );

  if (!productUrl) {
    return (
      <article className="cm-kit-card cm-kit-card--package">
        {inner}
        <span className="cm-kit-card-pending">Shopify product pending</span>
      </article>
    );
  }

  return (
    <article className="cm-kit-card cm-kit-card--package group">
      <Link
        to={productUrl}
        className="cm-kit-card-link no-underline hover:no-underline"
        prefetch="intent"
      >
        {inner}
      </Link>
    </article>
  );
}

export function PackageCatalogGrid({
  packages,
  shopifyConnected,
}: {
  packages: ShopifyPackageItem[];
  shopifyConnected?: boolean;
}) {
  const {translations: tr, locale} = useLocale();
  const [params] = useSearchParams();

  const filterGroups = buildPackageFilterGroups(
    TREK_FILTERS,
    DURATION_FILTERS,
    DIFFICULTY_FILTERS,
  );

  const filtered = packages.filter((pkg) => {
    const trek = params.get('trek');
    const duration = params.get('duration');
    const difficulty = params.get('difficulty');
    if (trek && pkg.trek !== trek) return false;
    if (duration && pkg.duration !== duration) return false;
    if (difficulty && pkg.difficulty !== difficulty) return false;
    return true;
  });

  return (
    <>
      <section className="cm-catalog-page bg-mist">
        <div className="tr-page-width cm-catalog-page-inner">
          <CatalogPageHeading title={tr.packages.title} />
          {!shopifyConnected ? (
            <p className="mb-4 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-charcoal/80">
              {tr.packages.shopifySetupHint}
            </p>
          ) : null}
          <div className="cm-catalog-layout">
            <PackageFiltersPanel
              groups={filterGroups}
              resultCount={filtered.length}
              totalCount={packages.length}
            />

            <div className="cm-catalog-main min-w-0">
              {filtered.length === 0 ? (
                <div className="cm-empty-state">
                  <IconMountain size={40} className="text-sage/50" />
                  <p className="mt-4 font-display text-lg font-semibold text-pine">
                    {tr.packages.noResults}
                  </p>
                </div>
              ) : (
                <div className="cm-catalog-grid cm-catalog-grid--packages">
                  {filtered.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      itemsCountLabel={tr.packages.itemsCount}
                      savingsLabel={locale === 'ka' ? 'ღირ.' : 'Was'}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}