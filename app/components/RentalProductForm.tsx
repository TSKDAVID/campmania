/**
 * RentalProductForm — Campmania custom booking component.
 *
 * Replaces the standard Shopify "Add to Cart" form with a rental-specific flow:
 *   1. Date range picker (start → end)
 *   2. Metro hub dropdown (Tbilisi station hand-delivery)
 *   3. Rent vs Buy (Rent-to-Own) toggle when eligible
 *
 * Cart line attributes contract (consumed by backend / Zapiet / custom app):
 *   - fulfillment_mode:  "rent" | "purchase"
 *   - rental_start:      ISO date (rent only)
 *   - rental_end:        ISO date (rent only)
 *   - metro_station:     station id slug
 *   - rent_to_own:       "true" | "false"
 *   - rental_credit_applied: prior rental fee credited (purchase only)
 *
 * Rent-to-own eligibility is resolved by the parent route loader (order history).
 * Pass `rentToOwnOffer` when the customer previously rented this exact product.
 */
import {useMemo, useState} from 'react';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useLocale} from '~/providers/LocaleProvider';
import {METRO_STATIONS, getStationLabel} from '~/lib/trailrent/metro';
import {
  calculateRentalTotal,
  formatGel,
  getDefaultDateRange,
  isDateRangeValid,
} from '~/lib/trailrent/pricing';

/** Fulfillment mode — maps to cart attribute `fulfillment_mode`. */
type FulfillmentMode = 'rent' | 'purchase';

export type RentToOwnOffer = {
  eligible: boolean;
  /** Prior rental fee to subtract from purchase price. */
  rentalCredit: number;
  /** Final discounted buy-now price. */
  buyNowPrice: number;
};

export type RentalProductFormProps = {
  /** Shopify variant GID — required for cart LinesAdd. */
  variantId: string;
  productTitle: string;
  /** Daily rental rate in GEL. */
  dailyRate: number;
  /** Full purchase price before rent-to-own credit (optional). */
  purchasePrice?: number;
  /** Set when parent loader confirms prior rental of this product. */
  rentToOwnOffer?: RentToOwnOffer;
  /** True when customer has `tier:trail-tested` tag — hides deposit warning. */
  isTrustedTier?: boolean;
  onSuccess?: () => void;
};

/** Build cart line attributes for the selected mode and booking details. */
function buildLineAttributes(options: {
  mode: FulfillmentMode;
  startDate: string;
  endDate: string;
  metroId: string;
  rentalCredit?: number;
}): Array<{key: string; value: string}> {
  const {mode, startDate, endDate, metroId, rentalCredit} = options;
  const isPurchase = mode === 'purchase';

  const attributes: Array<{key: string; value: string}> = [
    {key: 'fulfillment_mode', value: mode},
    {key: 'metro_station', value: metroId},
    {key: 'rent_to_own', value: isPurchase ? 'true' : 'false'},
  ];

  if (isPurchase) {
    if (rentalCredit != null && rentalCredit > 0) {
      attributes.push({
        key: 'rental_credit_applied',
        value: String(rentalCredit),
      });
    }
  } else {
    attributes.push(
      {key: 'rental_start', value: startDate},
      {key: 'rental_end', value: endDate},
    );
  }

  return attributes;
}

export function RentalProductForm({
  variantId,
  productTitle,
  dailyRate,
  purchasePrice,
  rentToOwnOffer,
  isTrustedTier = false,
  onSuccess,
}: RentalProductFormProps) {
  const {translations: tr, locale} = useLocale();
  const defaults = getDefaultDateRange();

  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [metroId, setMetroId] = useState(METRO_STATIONS[0]?.id ?? '');
  const [mode, setMode] = useState<FulfillmentMode>('rent');

  const canBuy = rentToOwnOffer?.eligible === true;
  const isRentMode = mode === 'rent';

  const datesValid = isDateRangeValid(startDate, endDate);
  const station = METRO_STATIONS.find((s) => s.id === metroId);

  const rentalPricing = useMemo(
    () => calculateRentalTotal(dailyRate, startDate, endDate),
    [dailyRate, startDate, endDate],
  );

  /** Cart lines payload — recomputed when form state changes. */
  const cartLines: OptimisticCartLineInput[] = useMemo(
    () => [
      {
        merchandiseId: variantId,
        quantity: 1,
        attributes: buildLineAttributes({
          mode,
          startDate,
          endDate,
          metroId,
          rentalCredit: rentToOwnOffer?.rentalCredit,
        }),
      },
    ],
    [variantId, mode, startDate, endDate, metroId, rentToOwnOffer?.rentalCredit],
  );

  const canSubmit = isRentMode ? datesValid : canBuy;
  const displayTotal = isRentMode
    ? rentalPricing.total
    : (rentToOwnOffer?.buyNowPrice ?? purchasePrice ?? dailyRate);

  return (
    <div className="rounded-md border border-stone bg-white p-6 shadow-sm">
      <p className="tr-eyebrow text-muted">{tr.booking.title}</p>
      <h2 className="mt-1 font-display text-xl font-bold text-charcoal">
        {productTitle}
      </h2>

      {/* ── Rent / Buy toggle (only when rent-to-own eligible) ─────────── */}
      {canBuy ? (
        <div
          className="mt-6 flex rounded-sm border border-stone p-1"
          role="group"
          aria-label={`${tr.booking.modeRent} / ${tr.booking.modeBuy}`}
        >
          <button
            type="button"
            onClick={() => setMode('rent')}
            className={`flex-1 rounded-sm px-4 py-2.5 text-sm font-semibold transition ${
              isRentMode
                ? 'bg-pine text-mist'
                : 'text-muted hover:bg-stone/50'
            }`}
          >
            {tr.booking.modeRent}
          </button>
          <button
            type="button"
            onClick={() => setMode('purchase')}
            className={`flex-1 rounded-sm px-4 py-2.5 text-sm font-semibold transition ${
              !isRentMode
                ? 'bg-amber text-pine'
                : 'text-muted hover:bg-stone/50'
            }`}
          >
            {tr.booking.modeBuy}
          </button>
        </div>
      ) : null}

      {/* ── Date range (rent mode only) ─────────────────────────────────── */}
      {isRentMode ? (
        <div className="mt-6">
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
                className="mt-1 w-full rounded-sm border border-stone bg-mist px-3 py-2 text-charcoal"
                aria-label={tr.booking.startDate}
              />
            </div>
            <div>
              <span className="text-xs text-muted">{tr.booking.endDate}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-sm border border-stone bg-mist px-3 py-2 text-charcoal"
                aria-label={tr.booking.endDate}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Rent-to-own purchase summary */
        <div className="mt-6 rounded-md border border-amber/40 bg-amber/5 p-4">
          <p className="text-sm font-semibold text-pine">
            {tr.booking.buyNow} {formatGel(displayTotal)}
          </p>
          {rentToOwnOffer?.rentalCredit ? (
            <p className="mt-1 text-sm text-muted">
              {tr.booking.rentalCredit}: −{formatGel(rentToOwnOffer.rentalCredit)}{' '}
              · {tr.booking.buyNowDiscount}
            </p>
          ) : null}
        </div>
      )}

      {/* ── Metro hub selector ──────────────────────────────────────────── */}
      <div className="mt-6">
        <label
          htmlFor="rental-metro-select"
          className="mb-2 block text-sm font-semibold uppercase tracking-wide text-muted"
        >
          {tr.booking.metro}
        </label>
        <select
          id="rental-metro-select"
          value={metroId}
          onChange={(e) => setMetroId(e.target.value)}
          className="w-full rounded-sm border border-stone bg-mist px-3 py-2.5 text-charcoal"
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

      {/* ── Pricing summary ─────────────────────────────────────────────── */}
      <div className="mt-6 rounded-md border border-stone bg-mist/50 p-4">
        {isRentMode ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted">{tr.booking.dailyRate}</span>
              <span>{formatGel(dailyRate)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted">
                {rentalPricing.days} {tr.booking.days}
              </span>
              <span>{formatGel(rentalPricing.subtotal)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-muted">{tr.booking.buyNow}</span>
            <span>{formatGel(displayTotal)}</span>
          </div>
        )}
        <div className="mt-3 flex justify-between border-t border-stone pt-3 font-semibold text-charcoal">
          <span>{tr.booking.total}</span>
          <span className="text-forest">{formatGel(displayTotal)}</span>
        </div>
      </div>

      {/* ── Deposit notice (hidden for Trusted Tier VIP) ────────────────── */}
      {!isTrustedTier ? (
        <p className="mt-4 rounded-md border border-moss/30 bg-moss/5 p-3 text-sm leading-relaxed text-muted">
          🛡️ {tr.booking.idNotice}
        </p>
      ) : null}

      {/* ── Submit — Hydrogen CartForm → POST /cart LinesAdd ────────────── */}
      <CartForm
        route="/cart"
        inputs={{lines: cartLines}}
        action={CartForm.ACTIONS.LinesAdd}
      >
        {(fetcher) => (
          <button
            type="submit"
            disabled={!canSubmit || fetcher.state !== 'idle'}
            onClick={() => {
              if (canSubmit && fetcher.state === 'idle') {
                onSuccess?.();
              }
            }}
            className="tr-btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canSubmit
              ? isRentMode
                ? tr.booking.confirm
                : `${tr.booking.buyNow} ${formatGel(displayTotal)}`
              : tr.booking.unavailable}
          </button>
        )}
      </CartForm>
    </div>
  );
}
