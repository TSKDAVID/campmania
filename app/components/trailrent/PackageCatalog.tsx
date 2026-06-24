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
    <section className="cm-catalog-page">
      <header className="cm-catalog-header">
        <h1 className="cm-catalog-header__title">{tr.packages.title}</h1>
        <p className="cm-catalog-header__sub">{tr.packages.subtitle}</p>
        {!shopifyConnected ? (
          <p className="text-sm text-muted" style={{marginTop: 'var(--space-2)'}}>
            {tr.packages.shopifySetupHint}
          </p>
        ) : null}
      </header>

      <PackageFiltersPanel
        groups={filterGroups}
        resultCount={filtered.length}
        totalCount={packages.length}
      />

      <div className="cm-catalog-grid-wrap">
        {filtered.length === 0 ? (
          <p className="text-muted">{tr.packages.noResults}</p>
        ) : (
          <div className="cm-product-grid">
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
    </section>
  );
}
