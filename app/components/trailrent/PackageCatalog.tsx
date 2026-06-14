import {Link} from 'react-router';
import {useSearchParams} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {
  DIFFICULTY_FILTERS,
  DURATION_FILTERS,
  TREK_FILTERS,
} from '~/lib/trailrent/catalog';
import type {ShopifyPackageItem} from '~/lib/trailrent/shopify-catalog';
import {PageBanner} from '~/components/trailrent/HomeSections';
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
  bookLabel,
  includedLabel,
  savingsLabel,
}: {
  pkg: ShopifyPackageItem;
  bookLabel: string;
  includedLabel: string;
  savingsLabel?: string;
}) {
  const diffStyle = DIFFICULTY_STYLES[pkg.difficulty] ?? 'bg-stone text-muted';
  const productUrl = pkg.productHandle ? `/products/${pkg.productHandle}` : null;

  return (
    <article className="cm-kit-card cm-kit-card--package group">
      <Link
        to={productUrl ?? '#'}
        className="cm-kit-card-media relative block overflow-hidden bg-stone no-underline hover:no-underline"
        tabIndex={productUrl ? 0 : -1}
      >
        {pkg.imageUrl ? (
          <CatalogCardImage
            src={pkg.imageUrl}
            alt={pkg.imageAlt ?? pkg.title}
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
          className={`cm-kit-card-badge absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:right-3 sm:top-3 sm:px-2.5 sm:text-[11px] ${diffStyle}`}
        >
          {pkg.difficultyLabel}
        </span>
        {pkg.savingsPercent ? (
          <span className="cm-kit-card-badge absolute left-2 top-2 rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold text-pine sm:left-3 sm:top-3 sm:px-2.5 sm:text-[11px]">
            -{pkg.savingsPercent}%
          </span>
        ) : null}
      </Link>

      <div className="cm-kit-card-body">
        <div className="cm-kit-card-meta flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted sm:text-[11px]">
          <span className="rounded-sm bg-stone/80 px-2 py-0.5 text-charcoal/80">
            {pkg.trekLabel}
          </span>
          <span className="text-stone">·</span>
          <span>{pkg.durationLabel}</span>
        </div>

        <h3 className="cm-kit-card-title mt-1.5 font-display font-bold leading-snug text-pine group-hover:text-forest sm:mt-2">
          {productUrl ? (
            <Link to={productUrl} className="no-underline hover:no-underline">
              {pkg.title}
            </Link>
          ) : (
            pkg.title
          )}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted sm:text-sm">
          {pkg.description}
        </p>

        <div className="mt-3 border-t border-stone/70 pt-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="font-display text-lg font-bold text-forest sm:text-2xl">
              {pkg.priceLabel}
            </p>
            {pkg.compareAtPrice ? (
              <p className="text-sm text-muted line-through">
                {savingsLabel} ₾{pkg.compareAtPrice}
              </p>
            ) : null}
          </div>
        </div>

        <div className="cm-kit-card-included mt-2 flex-1 sm:mt-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-moss sm:text-[11px]">
            {includedLabel}
          </p>
          <ul className="cm-kit-card-included-list mt-1.5 sm:mt-2">
            {pkg.items.slice(0, 4).map((item) => (
              <li
                key={item}
                className="cm-kit-card-included-item flex gap-2 text-xs text-charcoal/75 sm:text-sm"
              >
                <span
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss"
                  aria-hidden
                />
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
            {pkg.items.length > 4 ? (
              <li className="cm-kit-card-included-more text-xs text-muted">
                +{pkg.items.length - 4} more
              </li>
            ) : null}
          </ul>
        </div>

        {productUrl ? (
          <Link to={productUrl} className="tr-btn-primary cm-kit-card-cta mt-3 w-full gap-2 sm:mt-4">
            {bookLabel}
            <IconArrowRight size={16} className="opacity-80" />
          </Link>
        ) : (
          <span className="mt-4 block rounded-md border border-dashed border-stone px-3 py-2 text-center text-xs text-muted">
            Shopify product pending
          </span>
        )}
      </div>
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
      <PageBanner
        eyebrow={tr.packages.eyebrow}
        title={tr.packages.title}
        compact
      />
      <section className="tr-section-tight bg-mist">
        <div className="tr-page-width">
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
                  <p className="mt-1 text-sm text-muted">
                    {tr.packages.subtitle}
                  </p>
                </div>
              ) : (
                <div className="cm-catalog-grid cm-catalog-grid--packages">
                  {filtered.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      includedLabel={tr.packages.included}
                      bookLabel={tr.packages.viewAndBook}
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
