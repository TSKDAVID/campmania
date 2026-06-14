import {useState} from 'react';
import {Form} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {METRO_STATIONS, getStationLabel} from '~/lib/trailrent/metro';
import {
  calculateRentalTotal,
  formatGel,
  getDefaultDateRange,
  isDateRangeValid,
} from '~/lib/trailrent/pricing';

export type BookingTarget = {
  id: string;
  title: string;
  dailyRate: number;
  productHandle?: string;
  variantId?: string;
};

type BookingDrawerProps = {
  target: BookingTarget | null;
  open: boolean;
  onClose: () => void;
};

export function BookingDrawer({target, open, onClose}: BookingDrawerProps) {
  const {translations: tr, locale} = useLocale();
  const defaults = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [metroId, setMetroId] = useState(METRO_STATIONS[0]?.id ?? '');

  if (!open || !target) return null;

  const valid = isDateRangeValid(startDate, endDate);
  const pricing = calculateRentalTotal(target.dailyRate, startDate, endDate);
  const station = METRO_STATIONS.find((s) => s.id === metroId);

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label={tr.booking.close}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col bg-mist shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
      >
        <div className="flex items-center justify-between border-b border-stone px-6 py-4">
          <div>
            <p className="tr-eyebrow">{tr.booking.title}</p>
            <h2 id="booking-title" className="text-xl font-bold">
              {target.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-2 text-muted hover:bg-stone"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-muted">
                {tr.booking.dates}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-muted">{tr.booking.startDate}</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-sm border border-stone bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <span className="text-xs text-muted">{tr.booking.endDate}</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 w-full rounded-sm border border-stone bg-white px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="metro-select"
                className="mb-2 block text-sm font-semibold uppercase tracking-wide text-muted"
              >
                {tr.booking.metro}
              </label>
              <select
                id="metro-select"
                value={metroId}
                onChange={(e) => setMetroId(e.target.value)}
                className="w-full rounded-sm border border-stone bg-white px-3 py-2.5"
              >
                {METRO_STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {getStationLabel(s, locale)} · {s.line}
                  </option>
                ))}
              </select>
              {station ? (
                <p className="mt-2 text-sm text-muted">
                  {tr.booking.pickupWindow}: {station.pickupWindow}
                </p>
              ) : null}
            </div>

            <div className="rounded-md border border-stone bg-white p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">{tr.booking.dailyRate}</span>
                <span>{formatGel(target.dailyRate)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted">
                  {pricing.days} {tr.booking.days}
                </span>
                <span>{formatGel(pricing.subtotal)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-stone pt-3 font-semibold">
                <span>{tr.booking.total}</span>
                <span className="text-forest">{formatGel(pricing.total)}</span>
              </div>
            </div>

            <p className="rounded-md border border-moss/30 bg-moss/5 p-3 text-sm leading-relaxed text-muted">
              🛡️ {tr.booking.idNotice}
            </p>
          </div>
        </div>

        <div className="border-t border-stone p-6">
          {target.variantId ? (
            <Form method="post" action="/cart">
              <input type="hidden" name="cartFormAction" value="LinesAdd" />
              <input type="hidden" name="lines" value={JSON.stringify([{
                merchandiseId: target.variantId,
                quantity: 1,
                attributes: [
                  {key: 'rental_start', value: startDate},
                  {key: 'rental_end', value: endDate},
                  {key: 'metro_station', value: metroId},
                ],
              }])} />
              <button
                type="submit"
                disabled={!valid}
                className="tr-btn-primary w-full disabled:opacity-50"
              >
                {valid ? tr.booking.confirm : tr.booking.unavailable}
              </button>
            </Form>
          ) : (
            <button
              type="button"
              disabled={!valid}
              onClick={() => {
                alert(
                  `[Demo] Booked "${target.title}"\n${startDate} → ${endDate}\nMetro: ${metroId}\nTotal: ${formatGel(pricing.total)}\n\nConnect Shopify product to enable real cart.`,
                );
                onClose();
              }}
              className="tr-btn-primary w-full disabled:opacity-50"
            >
              {valid ? tr.booking.confirm : tr.booking.unavailable}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

export function useBookingWidget() {
  const [target, setTarget] = useState<BookingTarget | null>(null);
  const [open, setOpen] = useState(false);

  const openBooking = (item: BookingTarget) => {
    setTarget(item);
    setOpen(true);
  };

  const closeBooking = () => {
    setOpen(false);
    setTarget(null);
  };

  return {
    target,
    open,
    openBooking,
    closeBooking,
    drawer: (
      <BookingDrawer target={target} open={open} onClose={closeBooking} />
    ),
  };
}
