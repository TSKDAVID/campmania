import {type ReactNode, useEffect, useState} from 'react';
import {useSearchParams} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {
  IconCalendar,
  IconFilter,
  IconGauge,
  IconMountain,
  IconX,
} from '~/components/trailrent/Icons';

type FilterOption = {
  value: string;
  labelKa: string;
  labelEn: string;
};

type FilterGroup = {
  name: string;
  icon: ReactNode;
  labelKa: string;
  labelEn: string;
  options: readonly FilterOption[];
};

function FilterGroupSection({
  group,
  locale,
  active,
  onToggle,
}: {
  group: FilterGroup;
  locale: 'ka' | 'en';
  active: string | null;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="cm-filter-group">
      <div className="cm-filter-group-label">
        <span className="cm-filter-group-icon" aria-hidden>
          {group.icon}
        </span>
        <span>{locale === 'ka' ? group.labelKa : group.labelEn}</span>
      </div>
      <div className="cm-filter-pills">
        {group.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            className={`cm-filter-pill ${active === opt.value ? 'cm-filter-pill-active' : ''}`}
            aria-pressed={active === opt.value}
          >
            {locale === 'ka' ? opt.labelKa : opt.labelEn}
          </button>
        ))}
      </div>
    </div>
  );
}

function usePackageFilterParams(groups: FilterGroup[]) {
  const [params, setParams] = useSearchParams();

  const hasActive = groups.some((g) => params.get(g.name));
  const activeCount = groups.filter((g) => params.get(g.name)).length;

  const toggle = (name: string, value: string) => {
    const next = new URLSearchParams(params);
    if (params.get(name) === value) next.delete(name);
    else next.set(name, value);
    setParams(next, {preventScrollReset: true});
  };

  const clearAll = () => setParams({}, {preventScrollReset: true});

  const activeChips = groups.flatMap((group) => {
    const value = params.get(group.name);
    if (!value) return [];
    const opt = group.options.find((o) => o.value === value);
    if (!opt) return [];
    return [
      {
        key: group.name,
        label: opt.labelKa,
        labelEn: opt.labelEn,
        onRemove: () => toggle(group.name, value),
      },
    ];
  });

  return {
    params,
    hasActive,
    activeCount,
    toggle,
    clearAll,
    activeChips,
  };
}

export function PackageFiltersPanel({
  groups,
  resultCount,
  totalCount,
}: {
  groups: FilterGroup[];
  resultCount: number;
  totalCount: number;
}) {
  const {locale, translations: tr} = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const {params, hasActive, activeCount, toggle, clearAll, activeChips} =
    usePackageFilterParams(groups);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const filterGroups = groups.map((group) => (
    <FilterGroupSection
      key={group.name}
      group={group}
      locale={locale}
      active={params.get(group.name)}
      onToggle={(value) => toggle(group.name, value)}
    />
  ));

  return (
    <>
      <div className="cm-package-filters-mobile lg:hidden">
        <div className="cm-filter-mobile-toolbar">
          <button
            type="button"
            className="cm-filter-mobile-trigger"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
          >
            <IconFilter size={16} />
            <span>{tr.packages.filters}</span>
            {activeCount > 0 ? (
              <span className="cm-filter-mobile-badge">{activeCount}</span>
            ) : null}
          </button>
          <p className="cm-filter-mobile-count">
            {tr.packages.showing} {resultCount}/{totalCount}
          </p>
        </div>

        {activeChips.length > 0 ? (
          <div className="cm-filter-active-chips">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className="cm-filter-active-chip"
                onClick={chip.onRemove}
              >
                {locale === 'ka' ? chip.label : chip.labelEn}
                <IconX size={12} />
              </button>
            ))}
            <button type="button" className="cm-filter-clear-inline" onClick={clearAll}>
              {tr.packages.clearAll}
            </button>
          </div>
        ) : null}
      </div>

      {mobileOpen ? (
        <div className="cm-filter-sheet" role="dialog" aria-modal="true">
          <button
            type="button"
            className="cm-filter-sheet-backdrop"
            aria-label={tr.booking.close}
            onClick={() => setMobileOpen(false)}
          />
          <div className="cm-filter-sheet-panel">
            <div className="cm-filter-sheet-header">
              <h2 className="cm-filter-sheet-title">{tr.packages.filters}</h2>
              <button
                type="button"
                className="cm-filter-sheet-close"
                onClick={() => setMobileOpen(false)}
                aria-label={tr.booking.close}
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="cm-filter-sheet-body">{filterGroups}</div>
            <div className="cm-filter-sheet-footer">
              {hasActive ? (
                <button type="button" className="cm-filter-sheet-clear" onClick={clearAll}>
                  {tr.packages.clearAll}
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="cm-filter-sheet-apply"
                onClick={() => setMobileOpen(false)}
              >
                {tr.packages.showResults} ({resultCount})
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="cm-package-filters-desktop hidden lg:block">
        <div
          className="cm-filter-panel cm-filter-panel--sidebar"
          role="region"
          aria-label={tr.packages.filters}
        >
          <div className="cm-filter-panel-header cm-filter-panel-header--catalog">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-pine">{tr.packages.filters}</p>
              <p className="cm-filter-panel-meta">
                {tr.packages.showing} {resultCount} / {totalCount}
              </p>
            </div>
            {hasActive ? (
              <button type="button" onClick={clearAll} className="cm-filter-clear shrink-0">
                <IconX size={14} />
                {tr.packages.clearAll}
              </button>
            ) : null}
          </div>
          <div className="cm-filter-panel-body">{filterGroups}</div>
        </div>
      </div>
    </>
  );
}

export function GearFiltersBar({
  options,
  paramName = 'gear',
}: {
  options: readonly FilterOption[];
  paramName?: string;
}) {
  const {locale, translations: tr} = useLocale();
  const [params, setParams] = useSearchParams();
  const active = params.get(paramName);

  return (
    <div
      className="cm-filter-panel cm-filter-panel-inline"
      role="region"
      aria-label={tr.packages.filters}
    >
      <div className="cm-filter-panel-body">
        <div className="cm-filter-pills cm-filter-pills--scroll">
          <button
            type="button"
            onClick={() => setParams({}, {preventScrollReset: true})}
            className={`cm-filter-pill ${!active ? 'cm-filter-pill-active' : ''}`}
            aria-pressed={!active}
          >
            {locale === 'ka' ? 'ყველა' : 'All'}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setParams({[paramName]: opt.value}, {preventScrollReset: true})
              }
              className={`cm-filter-pill ${active === opt.value ? 'cm-filter-pill-active' : ''}`}
              aria-pressed={active === opt.value}
            >
              {locale === 'ka' ? opt.labelKa : opt.labelEn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function buildPackageFilterGroups(
  trekOptions: readonly FilterOption[],
  durationOptions: readonly FilterOption[],
  difficultyOptions: readonly FilterOption[],
): FilterGroup[] {
  return [
    {
      name: 'trek',
      icon: <IconMountain size={16} />,
      labelKa: 'ბილიკი',
      labelEn: 'Trail',
      options: trekOptions,
    },
    {
      name: 'duration',
      icon: <IconCalendar size={16} />,
      labelKa: 'ხანგრძლივობა',
      labelEn: 'Duration',
      options: durationOptions,
    },
    {
      name: 'difficulty',
      icon: <IconGauge size={16} />,
      labelKa: 'სირთულე',
      labelEn: 'Difficulty',
      options: difficultyOptions,
    },
  ];
}
