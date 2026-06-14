import {useSearchParams} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {GEAR_FILTERS, type GearItem} from '~/lib/trailrent/catalog';
import {SectionHeading} from '~/components/trailrent/HomeSections';
import {useBookingWidget} from '~/components/trailrent/BookingWidget';

export function GearCatalogGrid({gear}: {gear: GearItem[]}) {
  const {locale, translations: tr} = useLocale();
  const [params, setParams] = useSearchParams();
  const category = params.get('gear') ?? '';
  const {openBooking, drawer} = useBookingWidget();

  const filtered = category
    ? gear.filter((g) => g.category === category)
    : gear;

  return (
    <>
      {drawer}
      <section className="tr-section bg-white">
        <div className="tr-page-width">
          <SectionHeading
            eyebrow={tr.gear.eyebrow}
            title={tr.gear.title}
            subtitle={tr.gear.subtitle}
          />

          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setParams({}, {preventScrollReset: true})}
              className={`tr-pill ${!category ? 'tr-pill-active' : ''}`}
            >
              {locale === 'ka' ? 'ყველა' : 'All'}
            </button>
            {GEAR_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() =>
                  setParams({gear: f.value}, {preventScrollReset: true})
                }
                className={`tr-pill ${category === f.value ? 'tr-pill-active' : ''}`}
              >
                {locale === 'ka' ? f.labelKa : f.labelEn}
              </button>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <article key={item.id} className="tr-card overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-stone to-sage/20" />
                <div className="p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-moss">
                    {item.categoryLabel}
                  </span>
                  <h3 className="mt-1 text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-muted">{item.subtitle}</p>
                  <p className="mt-3 font-semibold text-forest">{item.priceLabel}</p>
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
                    className="tr-btn-secondary mt-4 w-full"
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
