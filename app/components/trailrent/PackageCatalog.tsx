import {useSearchParams} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {
  DIFFICULTY_FILTERS,
  DURATION_FILTERS,
  TREK_FILTERS,
  type PackageItem,
} from '~/lib/trailrent/catalog';
import {PageBanner} from '~/components/trailrent/HomeSections';
import {useBookingWidget} from '~/components/trailrent/BookingWidget';
import {
  buildPackageFilterGroups,
  PackageFiltersPanel,
} from '~/components/trailrent/CatalogFilters';
import {IconArrowRight, IconMountain} from '~/components/trailrent/Icons';

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-moss/15 text-moss border-moss/25',
  moderate: 'bg-amber/15 text-forest border-amber/30',
  hard: 'bg-pine/10 text-pine border-pine/20',
};

const TREK_GRADIENTS: Record<string, string> = {
  tobavarchkhili: 'from-forest/80 via-moss/50 to-sage/30',
  birtvisi: 'from-pine/70 via-forest/50 to-moss/40',
  kazbegi: 'from-charcoal/60 via-pine/50 to-forest/40',
};

function PackageCard({
  pkg,
  onBook,
  bookLabel,
  includedLabel,
}: {
  pkg: PackageItem;
  onBook: () => void;
  bookLabel: string;
  includedLabel: string;
}) {
  const gradient = TREK_GRADIENTS[pkg.trek] ?? 'from-forest/60 to-moss/30';
  const diffStyle = DIFFICULTY_STYLES[pkg.difficulty] ?? 'bg-stone text-muted';

  return (
    <article className="cm-kit-card group">
      <div className={`cm-kit-card-media bg-gradient-to-br ${gradient}`}>
        <div className="cm-kit-card-pattern" aria-hidden />
        <IconMountain size={32} className="relative z-[1] text-white/40" />
        <span
          className={`absolute right-3 top-3 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${diffStyle}`}
        >
          {pkg.difficultyLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          <span className="rounded-sm bg-stone/80 px-2 py-0.5 text-charcoal/80">
            {pkg.trekLabel}
          </span>
          <span className="text-stone">·</span>
          <span>{pkg.durationLabel}</span>
        </div>

        <h3 className="mt-2 font-display text-xl font-bold leading-snug text-pine group-hover:text-forest">
          {pkg.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
          {pkg.description}
        </p>

        <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-stone/70 pt-3">
          <p className="font-display text-2xl font-bold text-forest">{pkg.priceLabel}</p>
          <span className="text-xs text-muted">/ day</span>
        </div>

        <div className="mt-3 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-moss">
            {includedLabel}
          </p>
          <ul className="mt-2 space-y-1">
            {pkg.items.slice(0, 3).map((item) => (
              <li key={item} className="flex gap-2 text-sm text-charcoal/75">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss" aria-hidden />
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
            {pkg.items.length > 3 ? (
              <li className="text-xs text-muted">+{pkg.items.length - 3} more</li>
            ) : null}
          </ul>
        </div>

        <button type="button" onClick={onBook} className="tr-btn-primary mt-4 w-full gap-2">
          {bookLabel}
          <IconArrowRight size={16} className="opacity-80" />
        </button>
      </div>
    </article>
  );
}

export function PackageCatalogGrid({packages}: {packages: PackageItem[]}) {
  const {translations: tr} = useLocale();
  const [params] = useSearchParams();
  const {openBooking, drawer} = useBookingWidget();

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
      {drawer}
      <PageBanner
        eyebrow={tr.packages.eyebrow}
        title={tr.packages.title}
        subtitle={tr.packages.subtitle}
        compact
      />
      <section className="tr-section-tight bg-mist">
        <div className="tr-page-width">
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
                      bookLabel={tr.packages.bookKit}
                      onBook={() =>
                        openBooking({
                          id: pkg.id,
                          title: pkg.title,
                          dailyRate: pkg.dailyRate,
                          productHandle: pkg.productHandle,
                        })
                      }
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
