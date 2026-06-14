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
    <article className="cm-kit-card group">
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
          className={`absolute right-3 top-3 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${diffStyle}`}
        >
          {pkg.difficultyLabel}
        </span>
        {pkg.savingsPercent ? (
          <span className="absolute left-3 top-3 rounded-full bg-amber px-2.5 py-0.5 text-[11px] font-bold text-pine">
            -{pkg.savingsPercent}%
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          <span className="rounded-sm bg-stone/80 px-2 py-0.5 text-charcoal/80">
            {pkg.trekLabel}
          </span>
          <span className="text-stone">·</span>
          <span>{pkg.durationLabel}</span>
        </div>

        <h3 className="mt-2 font-display text-xl font-bold leading-snug text-pine group-hover:text-forest">
          {productUrl ? (
            <Link to={productUrl} className="no-underline hover:no-underline">
              {pkg.title}
            </Link>
          ) : (
            pkg.title
          )}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
          {pkg.description}
        </p>

        <div className="mt-3 border-t border-stone/70 pt-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="font-display text-2xl font-bold text-forest">
              {pkg.priceLabel}
            </p>
            {pkg.compareAtPrice ? (
              <p className="text-sm text-muted line-through">
                {savingsLabel} ₾{pkg.compareAtPrice}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-moss">
            {includedLabel}
          </p>
          <ul className="mt-2 space-y-1">
            {pkg.items.slice(0, 3).map((item) => (
              <li key={item} className="flex gap-2 text-sm text-charcoal/75">
                <span
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss"
                  aria-hidden
                />
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
            {pkg.items.length > 3 ? (
              <li className="text-xs text-muted">+{pkg.items.length - 3} more</li>
            ) : null}
          </ul>
        </div>

        {productUrl ? (
          <Link to={productUrl} className="tr-btn-primary mt-4 w-full gap-2">
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
        subtitle={tr.packages.subtitle}
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
                <div className="cm-catalog-grid">
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
