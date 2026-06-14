import {useSearchParams} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {GEAR_FILTERS, type GearItem} from '~/lib/trailrent/catalog';
import {PageBanner} from '~/components/trailrent/HomeSections';
import {useBookingWidget} from '~/components/trailrent/BookingWidget';
import {GearFiltersBar} from '~/components/trailrent/CatalogFilters';

export function GearCatalogGrid({gear}: {gear: GearItem[]}) {
  const {translations: tr} = useLocale();
  const [params] = useSearchParams();
  const category = params.get('gear') ?? '';
  const {openBooking, drawer} = useBookingWidget();

  const filtered = category ? gear.filter((g) => g.category === category) : gear;

  return (
    <>
      {drawer}
      <PageBanner
        eyebrow={tr.gear.eyebrow}
        title={tr.gear.title}
        subtitle={tr.gear.subtitle}
        compact
      />
      <section className="tr-section-tight bg-white">
        <div className="tr-page-width">
          <GearFiltersBar options={GEAR_FILTERS} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <article key={item.id} className="cm-kit-card group">
                <div className="cm-kit-card-media bg-gradient-to-br from-stone via-mist to-sage/20">
                  <div className="cm-kit-card-pattern opacity-20" aria-hidden />
                </div>
                <div className="p-4 md:p-5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-moss">
                    {item.categoryLabel}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-pine group-hover:text-forest">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted">{item.subtitle}</p>
                  <div className="mt-3 flex items-baseline justify-between border-t border-stone/70 pt-3">
                    <p className="font-display text-xl font-bold text-forest">
                      {item.priceLabel}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      openBooking({
                        id: item.id,
                        title: item.title,
                        dailyRate: item.dailyRate,
                        productHandle: item.productHandle,
                      })
                    }
                    className="tr-btn-secondary mt-3 w-full py-2.5 text-xs"
                  >
                    {tr.gear.bookItem}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
