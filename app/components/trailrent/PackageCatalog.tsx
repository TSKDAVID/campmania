import {useMemo} from 'react';
import {useSearchParams} from 'react-router';
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
  buildPackageFilterGroups,
  PackageFiltersPanel,
} from '~/components/trailrent/CatalogFilters';
import {PackageCard} from '~/components/trailrent/PackageCard';
import {IconMountain} from '~/components/trailrent/Icons';

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
        <PackageFiltersPanel
          groups={filterGroups}
          resultCount={filtered.length}
          totalCount={packages.length}
        />

        <div className="tr-page-width">
          <div className="cm-catalog-shell cm-catalog-page-inner">
          {!shopifyConnected ? (
            <p className="rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-charcoal/80">
              {tr.packages.shopifySetupHint}
            </p>
          ) : null}

          <div className="cm-catalog-page-title-row">
            <h1 className="cm-catalog-heading cm-catalog-heading--row">
              {tr.packages.title}
            </h1>
            <p className="cm-catalog-technical-note">
              {locale === 'ka'
                ? `კოლექცია ${filtered.length}/${packages.length}`
                : `Collection ${filtered.length}/${packages.length}`}
            </p>
          </div>

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
      </section>
    </>
  );
}
