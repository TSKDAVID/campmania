import {useMemo, useState} from 'react';
import {Link, useSearchParams} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {
  buildTrekFilterOptionsFromPackages,
  DIFFICULTY_FILTERS,
  DURATION_FILTERS,
} from '~/lib/trailrent/catalog';
import type {
  ShopifyGearItem,
  ShopifyPackageItem,
} from '~/lib/trailrent/shopify-catalog';
import {
  normalizePackageDuration,
  packageDurationDays,
  resolvePackageComposition,
  type GearBuilderProduct,
  type PackageDuration,
} from '~/lib/trailrent/gear-builder';
import {
  buildPackageFilterGroups,
  PackageFiltersPanel,
} from '~/components/trailrent/CatalogFilters';
import {PackageCardImageScrubber} from '~/components/trailrent/PackageCardImageScrubber';
import {
  PriceWithCompare,
  TotalWithCompare,
} from '~/components/trailrent/PriceWithCompare';
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
    normalizePackageDuration(
      pkg.defaultDuration ?? (pkg.duration as PackageDuration),
    ),
  );
  const gearCatalog = useMemo(() => {
    const byHandle = new Map<string, GearBuilderProduct>();
    for (const item of gear) {
      byHandle.set(item.builderProduct.handle, item.builderProduct);
    }
    for (const product of pkg.includedCollectionProducts ?? []) {
      byHandle.set(product.handle, product);
    }
    return [...byHandle.values()];
  }, [gear, pkg.includedCollectionProducts]);

  const baseProductHandles = useMemo(() => {
    if (pkg.includedCollectionProducts?.length) {
      return pkg.includedCollectionProducts.map((product) => product.handle);
    }
    return pkg.includedProductHandles ?? [];
  }, [pkg.includedCollectionProducts, pkg.includedProductHandles]);

  const composition = useMemo(
    () =>
      resolvePackageComposition({
        trek: pkg.trek,
        duration: selectedDuration,
        baseProductHandles,
        fallbackItemLabels: pkg.items,
        gearCatalog,
      }),
    [pkg, selectedDuration, baseProductHandles, gearCatalog],
  );

  const selectedDays = packageDurationDays(selectedDuration);
  const perDayWord = locale === 'ka' ? 'დღე' : selectedDays === 1 ? 'day' : 'days';

  const cardImages = useMemo(() => {
    if (pkg.imageUrls?.length) return pkg.imageUrls;
    if (pkg.imageUrl) return [pkg.imageUrl];
    return [];
  }, [pkg.imageUrls, pkg.imageUrl]);

  const includedThumbs = useMemo(() => {
    const thumbSource =
      pkg.includedCollectionProducts?.length
        ? pkg.includedCollectionProducts.map((product) => ({
            title: product.title,
            imageUrl: product.imageUrl,
            handle: product.handle,
          }))
        : composition.items;

    return thumbSource.slice(0, 5).map((item) => ({
      label: item.title,
      imageUrl: item.imageUrl,
      href: `/products/${item.handle}`,
    }));
  }, [pkg.includedCollectionProducts, composition.items]);

  const displayedItems =
    pkg.includedCollectionProducts?.length
      ? pkg.includedCollectionProducts.map((product) => product.title)
      : composition.items.map((item) => item.title);
  const hasComposition = composition.items.length > 0;
  const bundleDaily = hasComposition ? composition.bundleDaily : pkg.dailyRate;
  const bundleTotal = hasComposition
    ? composition.bundleTotal
    : pkg.dailyRate * selectedDays;
  const subtotalDaily = hasComposition
    ? composition.subtotalDaily
    : pkg.compareAtPrice ?? null;
  const subtotalTotal =
    subtotalDaily != null && subtotalDaily > bundleDaily
      ? subtotalDaily * selectedDays
      : null;
  const showCompare =
    subtotalDaily != null && subtotalDaily > bundleDaily;
  const discountPercent = hasComposition
    ? composition.discountPercent
    : pkg.savingsPercent;

  const inner = (
    <div className="cm-pkg-card__layout">
      <div className="cm-kit-card-media cm-pkg-card__media">
        {cardImages.length > 0 ? (
          <PackageCardImageScrubber
            images={cardImages}
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
          className={`cm-kit-card-badge absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${diffStyle}`}
        >
          {pkg.difficultyLabel}
        </span>
        {discountPercent ? (
          <span className="cm-kit-card-badge absolute left-2 top-2 rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold text-pine">
            -{discountPercent}%
          </span>
        ) : null}
      </div>

      <div className="cm-pkg-card__body">
        <header className="cm-pkg-card__header">
          <div className="cm-kit-card-meta">
            <span>{pkg.trekLabel}</span>
            <span aria-hidden>·</span>
            <span>
              {selectedDays} {perDayWord}
            </span>
          </div>
          <h3 className="cm-kit-card-title">{pkg.title}</h3>
        </header>

        <div className="cm-pkg-card__middle">
          {includedThumbs.length > 0 ? (
            <div className="cm-pkg-card__thumbs">
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
          ) : null}

          {displayedItems.length > 0 ? (
            <p className="cm-pkg-card__included">
              <span className="sr-only">{includedLabel}: </span>
              {displayedItems.slice(0, 4).join(' · ')}
              {displayedItems.length > 4
                ? ` +${displayedItems.length - 4}`
                : null}
            </p>
          ) : null}

          <div className="cm-pkg-card__actions">
            <div
              className="cm-kit-card-duration-row"
              role="group"
              aria-label="Package duration"
            >
              {durationOptions.map((option) => (
                <button
                  key={`${pkg.id}-${option.value}`}
                  type="button"
                  className={`cm-kit-card-duration-btn ${
                    selectedDuration === option.value
                      ? 'cm-kit-card-duration-btn--active'
                      : ''
                  }`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setSelectedDuration(
                      normalizePackageDuration(option.value),
                    );
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="cm-pkg-card__daily-price">
              <PriceWithCompare
                amount={bundleDaily}
                compareAtAmount={showCompare ? subtotalDaily : undefined}
                suffix={` / ${perDayWord}`}
                compareLabel={savingsLabel}
              />
            </div>
          </div>
        </div>

        <footer className="cm-kit-card-footer cm-pkg-card__footer">
          <TotalWithCompare
            label={totalLabel}
            amount={bundleTotal}
            compareAtAmount={
              showCompare ? subtotalTotal ?? undefined : undefined
            }
            meta={
              displayedItems.length > 0
                ? ` · ${displayedItems.length} ${itemsCountLabel}`
                : undefined
            }
          />
          <span className="cm-kit-card-arrow" aria-hidden>
            <IconArrowRight size={18} />
          </span>
        </footer>
      </div>
    </div>
  );

  return (
    <article className="cm-kit-card cm-kit-card--package group">
      {productUrl ? (
        <Link
          to={productUrl}
          className="cm-kit-card-stretched-link no-underline hover:no-underline"
          aria-label={pkg.title}
          prefetch="intent"
        />
      ) : null}
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
  const activeTrek = params.get('trek');
  const durationOptions = DURATION_FILTERS.map((option) => ({
    value: option.value,
    label: locale === 'ka' ? option.labelKa : option.labelEn,
  }));

  const trekOptions = useMemo(
    () =>
      buildTrekFilterOptionsFromPackages(packages, {
        limit: 3,
        activeTrek,
      }),
    [packages, activeTrek],
  );

  const filterGroups = useMemo(() => {
    const groups = buildPackageFilterGroups(
      trekOptions,
      DURATION_FILTERS,
      DIFFICULTY_FILTERS,
    );
    return groups.filter(
      (group) => group.name !== 'trek' || group.options.length > 0,
    );
  }, [trekOptions]);

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
          {!shopifyConnected ? (
            <p className="rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-charcoal/80">
              {tr.packages.shopifySetupHint}
            </p>
          ) : null}
          <div className="cm-catalog-layout cm-catalog-layout--packages">
            <div className="cm-catalog-page-title-row">
              <h1 className="cm-catalog-heading cm-catalog-heading--row">
                {tr.packages.title}
              </h1>
            </div>

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