import {useMemo, useState} from 'react';
import {Link, useSearchParams} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {
  DIFFICULTY_FILTERS,
  DURATION_FILTERS,
  TREK_FILTERS,
} from '~/lib/trailrent/catalog';
import type {
  ShopifyGearItem,
  ShopifyPackageItem,
} from '~/lib/trailrent/shopify-catalog';
import {formatGel} from '~/lib/trailrent/pricing';
import {
  resolvePackageComposition,
  type PackageDuration,
} from '~/lib/trailrent/gear-builder';
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
  gear,
  locale,
  durationOptions,
  totalLabel,
  itemsCountLabel,
  savingsLabel,
  includedLabel,
}: {
  pkg: ShopifyPackageItem;
  gear: ShopifyGearItem[];
  locale: 'ka' | 'en';
  durationOptions: Array<{value: string; label: string}>;
  totalLabel: string;
  itemsCountLabel: string;
  savingsLabel?: string;
  includedLabel: string;
}) {
  const diffStyle = DIFFICULTY_STYLES[pkg.difficulty] ?? 'bg-stone text-muted';
  const productUrl = pkg.productHandle ? `/products/${pkg.productHandle}` : null;
  const [selectedDuration, setSelectedDuration] = useState<PackageDuration>(
    pkg.defaultDuration ?? (pkg.duration as PackageDuration),
  );
  const gearCatalog = useMemo(
    () => gear.map((item) => item.builderProduct),
    [gear],
  );

  const composition = useMemo(
    () =>
      resolvePackageComposition({
        trek: pkg.trek,
        duration: selectedDuration,
        baseProductHandles: pkg.includedProductHandles ?? [],
        fallbackItemLabels: pkg.items,
        gearCatalog,
      }),
    [pkg, selectedDuration, gearCatalog],
  );

  const selectedDays = composition.days;
  const perDayWord = locale === 'ka' ? 'დღე' : 'day';

  const includedThumbs = useMemo(
    () =>
      composition.items.slice(0, 5).map((item) => ({
        label: item.title,
        imageUrl: item.imageUrl,
        href: `/products/${item.handle}`,
      })),
    [composition.items],
  );

  const displayedItems = composition.items.map((item) => item.title);
  const dynamicPriceLabel = `${formatGel(composition.bundleDaily)} / ${perDayWord}`;
  const totalPrice = composition.bundleTotal;

  const inner = (
    <>
      <div className="cm-kit-card-media relative overflow-hidden">
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
        {pkg.savingsPercent || composition.discountPercent ? (
          <span className="cm-kit-card-badge absolute left-2 top-2 rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold text-pine">
            -{pkg.savingsPercent ?? composition.discountPercent}%
          </span>
        ) : null}
      </div>

      <div className="cm-kit-card-includes-strip">
        {includedThumbs.map((thumb) => (
          <Link
            key={`${pkg.id}-${thumb.label}`}
            to={thumb.href}
            className="cm-kit-card-includes-thumb no-underline hover:no-underline"
            title={thumb.label}
            aria-label={thumb.label}
            prefetch="intent"
          >
            {thumb.imageUrl ? (
              <img src={thumb.imageUrl} alt={thumb.label} loading="lazy" />
            ) : (
              <span>{thumb.label.slice(0, 2).toUpperCase()}</span>
            )}
          </Link>
        ))}
      </div>

      <div className="cm-kit-card-body">
        <div className="cm-kit-card-meta">
          <span>{pkg.trekLabel}</span>
          <span aria-hidden>·</span>
          <span>{selectedDays} {perDayWord}</span>
        </div>

        {productUrl ? (
          <Link
            to={productUrl}
            className="cm-kit-card-title no-underline hover:no-underline"
            prefetch="intent"
          >
            {pkg.title}
          </Link>
        ) : (
          <h3 className="cm-kit-card-title">{pkg.title}</h3>
        )}

        <div className="cm-kit-card-duration-row" role="group" aria-label="Package duration">
          {durationOptions.map((option) => (
            <button
              key={`${pkg.id}-${option.value}`}
              type="button"
              className={`cm-kit-card-duration-btn ${
                selectedDuration === option.value ? 'cm-kit-card-duration-btn--active' : ''
              }`}
              onClick={() => setSelectedDuration(option.value as PackageDuration)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="cm-kit-card-reveal" aria-hidden>
          <div className="cm-kit-card-reveal-inner">
            {pkg.description ? (
              <p className="cm-kit-card-desc">{pkg.description}</p>
            ) : null}
            {displayedItems.length > 0 ? (
              <div>
                <p className="cm-kit-card-included-label">{includedLabel}</p>
                <ul className="cm-kit-card-included-list">
                  {displayedItems.slice(0, 6).map((item) => (
                    <li key={item} className="cm-kit-card-included-item">
                      {item}
                    </li>
                  ))}
                  {displayedItems.length > 6 ? (
                    <li className="cm-kit-card-included-more text-xs text-muted">
                      +{displayedItems.length - 6}
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="cm-kit-card-footer">
          <div className="min-w-0">
            <p className="cm-kit-card-price">{dynamicPriceLabel}</p>
            <p className="cm-kit-card-count">
              {totalLabel}: {formatGel(totalPrice)}
            </p>
            {pkg.compareAtPrice ? (
              <p className="cm-kit-card-compare">
                <span className="sr-only">{savingsLabel}</span>
                ₾{pkg.compareAtPrice}
              </p>
            ) : null}
            {displayedItems.length > 0 ? (
              <p className="cm-kit-card-count">
                {displayedItems.length} {itemsCountLabel}
              </p>
            ) : null}
          </div>
          {productUrl ? (
            <Link
              to={productUrl}
              className="cm-kit-card-arrow no-underline hover:no-underline"
              aria-label={pkg.title}
              prefetch="intent"
            >
              <IconArrowRight size={18} />
            </Link>
          ) : (
            <span className="cm-kit-card-arrow" aria-hidden>
              <IconArrowRight size={18} />
            </span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <article className="cm-kit-card cm-kit-card--package">
      {inner}
      {!productUrl ? (
        <span className="cm-kit-card-pending">Shopify product pending</span>
      ) : null}
    </article>
  );
}

export function PackageCatalogGrid({
  packages,
  gear,
  shopifyConnected,
}: {
  packages: ShopifyPackageItem[];
  gear: ShopifyGearItem[];
  shopifyConnected?: boolean;
}) {
  const {translations: tr, locale} = useLocale();
  const [params] = useSearchParams();
  const durationOptions = DURATION_FILTERS.map((option) => ({
    value: option.value,
    label: locale === 'ka' ? option.labelKa : option.labelEn,
  }));

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
          <div className="cm-catalog-layout cm-catalog-layout--packages">
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
                      gear={gear}
                      locale={locale}
                      durationOptions={durationOptions}
                      totalLabel={tr.booking.total}
                      itemsCountLabel={tr.packages.itemsCount}
                      savingsLabel={locale === 'ka' ? 'ღირ.' : 'Was'}
                      includedLabel={tr.packages.included}
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