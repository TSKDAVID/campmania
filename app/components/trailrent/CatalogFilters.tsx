import type {ReactNode} from 'react';
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
  const [params, setParams] = useSearchParams();

  const hasActive = groups.some((g) => params.get(g.name));

  const toggle = (name: string, value: string) => {
    const next = new URLSearchParams(params);
    if (params.get(name) === value) next.delete(name);
    else next.set(name, value);
    setParams(next, {preventScrollReset: true});
  };

  const clearAll = () => setParams({}, {preventScrollReset: true});

  return (
    <div className="cm-filter-panel" role="region" aria-label={tr.packages.filters}>
      <div className="cm-filter-panel-header">
        <div className="flex items-center gap-2.5">
          <span className="cm-filter-panel-icon" aria-hidden>
            <IconFilter size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-pine">{tr.packages.filters}</p>
            <p className="text-xs text-muted">
              {tr.packages.showing} {resultCount} / {totalCount}
            </p>
          </div>
        </div>
        {hasActive ? (
          <button type="button" onClick={clearAll} className="cm-filter-clear">
            <IconX size={14} />
            {tr.packages.clearAll}
          </button>
        ) : null}
      </div>

      <div className="cm-filter-panel-body">
        {groups.map((group) => (
          <FilterGroupSection
            key={group.name}
            group={group}
            locale={locale}
            active={params.get(group.name)}
            onToggle={(value) => toggle(group.name, value)}
          />
        ))}
      </div>
    </div>
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
        <div className="cm-filter-pills">
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
