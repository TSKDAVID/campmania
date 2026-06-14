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

function FilterPills({
  name,
  options,
  locale,
}: {
  name: string;
  options: readonly {value: string; labelKa: string; labelEn: string}[];
  locale: 'ka' | 'en';
}) {
  const [params, setParams] = useSearchParams();
  const active = params.get(name);

  const toggle = (value: string) => {
    const next = new URLSearchParams(params);
    if (active === value) next.delete(name);
    else next.set(name, value);
    setParams(next, {preventScrollReset: true});
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={`tr-pill ${active === opt.value ? 'tr-pill-active' : ''}`}
        >
          {locale === 'ka' ? opt.labelKa : opt.labelEn}
        </button>
      ))}
    </div>
  );
}

export function PackageCatalogGrid({packages}: {packages: PackageItem[]}) {
  const {locale, translations: tr} = useLocale();
  const [params, setParams] = useSearchParams();
  const {openBooking, drawer} = useBookingWidget();

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
      />
      <section className="tr-section bg-mist">
        <div className="tr-page-width">
          <div className="mb-8 space-y-4 rounded-md border border-stone bg-white p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              {tr.packages.filters}
            </p>
            <FilterPills name="trek" options={TREK_FILTERS} locale={locale} />
            <FilterPills name="duration" options={DURATION_FILTERS} locale={locale} />
            <FilterPills name="difficulty" options={DIFFICULTY_FILTERS} locale={locale} />
            {(params.get('trek') || params.get('duration') || params.get('difficulty')) && (
              <button
                type="button"
                onClick={() => setParams({}, {preventScrollReset: true})}
                className="cm-link text-sm"
              >
                {tr.packages.clearAll}
              </button>
            )}
            <p className="text-sm text-muted">
              {tr.packages.showing} {filtered.length} / {packages.length}
            </p>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-muted">{tr.packages.noResults}</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((pkg) => (
                <article key={pkg.id} className="tr-card flex flex-col overflow-hidden">
                  <div className="aspect-[4/3] bg-gradient-to-br from-forest/20 to-moss/30" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-sm bg-stone px-2 py-0.5">{pkg.trekLabel}</span>
                      <span className="rounded-sm bg-stone px-2 py-0.5">{pkg.durationLabel}</span>
                      <span className="rounded-sm bg-stone px-2 py-0.5">{pkg.difficultyLabel}</span>
                    </div>
                    <h3 className="text-xl font-bold">{pkg.title}</h3>
                    <p className="mt-2 text-sm text-muted">{pkg.description}</p>
                    <p className="mt-3 font-semibold text-forest">{pkg.priceLabel}</p>
                    <div className="mt-4 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        {tr.packages.included}
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-muted">
                        {pkg.items.slice(0, 4).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openBooking({
                          id: pkg.id,
                          title: pkg.title,
                          dailyRate: pkg.dailyRate,
                          productHandle: pkg.productHandle,
                        })
                      }
                      className="tr-btn-primary mt-5 w-full"
                    >
                      {tr.packages.bookKit}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
