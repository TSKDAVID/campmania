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
import {
  IconCalendar,
  IconCart,
  IconMapPin,
  IconShield,
} from '~/components/trailrent/Icons';

type FulfillmentMode = 'rent' | 'purchase';

export type RentToOwnOffer = {
  eligible: boolean;
  rentalCredit: number;
  buyNowPrice: number;
};

export type RentalProductFormProps = {
  variantId: string;
  productTitle: string;
  dailyRate: number;
  purchasePrice?: number;
  rentToOwnOffer?: RentToOwnOffer;
  isTrustedTier?: boolean;
  onSuccess?: () => void;
  /** Hides duplicate product title when shown beside the page header. */
  compact?: boolean;
};

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
  compact = false,
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
    <div
      className={`cm-rental-form${compact ? ' cm-rental-form--compact' : ''}`}
    >
      <header className="cm-rental-form-header">
        <p className="tr-eyebrow">{tr.booking.title}</p>
        {!compact ? (
          <h2 className="mt-1 font-display text-xl font-bold text-pine md:text-2xl">
            {productTitle}
          </h2>
        ) : null}
      </header>

      {canBuy ? (
        <div
          className="cm-rental-mode-toggle"
          role="group"
          aria-label={`${tr.booking.modeRent} / ${tr.booking.modeBuy}`}
        >
          <button
            type="button"
            onClick={() => setMode('rent')}
            className={`cm-rental-mode-btn ${isRentMode ? 'cm-rental-mode-btn--active' : ''}`}
          >
            {tr.booking.modeRent}
          </button>
          <button
            type="button"
            onClick={() => setMode('purchase')}
            className={`cm-rental-mode-btn ${!isRentMode ? 'cm-rental-mode-btn--buy' : ''}`}
          >
            {tr.booking.modeBuy}
          </button>
        </div>
      ) : null}

      {isRentMode ? (
        <div className="cm-rental-field">
          <label className="cm-form-label">
            <span className="inline-flex items-center gap-2">
              <IconCalendar size={16} className="text-moss" />
              {tr.booking.dates}
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">
                {tr.booking.startDate}
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="cm-form-field"
                aria-label={tr.booking.startDate}
              />
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">
                {tr.booking.endDate}
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="cm-form-field"
                aria-label={tr.booking.endDate}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="cm-rental-rto-banner">
          <p className="text-sm font-semibold text-pine">
            {tr.booking.buyNow} {formatGel(displayTotal)}
          </p>
          {rentToOwnOffer?.rentalCredit ? (
            <p className="mt-1 text-sm text-muted">
              {tr.booking.rentalCredit}: −{formatGel(rentToOwnOffer.rentalCredit)} ·{' '}
              {tr.booking.buyNowDiscount}
            </p>
          ) : null}
        </div>
      )}

      <div className="cm-rental-field">
        <label htmlFor="rental-metro-select" className="cm-form-label">
          <span className="inline-flex items-center gap-2">
            <IconMapPin size={16} className="text-moss" />
            {tr.booking.metro}
          </span>
        </label>
        <select
          id="rental-metro-select"
          value={metroId}
          onChange={(e) => setMetroId(e.target.value)}
          className="cm-form-field"
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

      <div className="cm-rental-summary">
        {isRentMode ? (
          <>
            <div className="cm-rental-summary-row">
              <span>{tr.booking.dailyRate}</span>
              <span>{formatGel(dailyRate)}</span>
            </div>
            <div className="cm-rental-summary-row">
              <span>
                {rentalPricing.days} {tr.booking.days}
              </span>
              <span>{formatGel(rentalPricing.subtotal)}</span>
            </div>
          </>
        ) : (
          <div className="cm-rental-summary-row">
            <span>{tr.booking.buyNow}</span>
            <span>{formatGel(displayTotal)}</span>
          </div>
        )}
        <div className="cm-rental-summary-total">
          <span>{tr.booking.total}</span>
          <span>{formatGel(displayTotal)}</span>
        </div>
      </div>

      {!isTrustedTier ? (
        <p className="cm-rental-notice">
          <IconShield size={18} className="shrink-0 text-moss" />
          <span>{tr.booking.idNotice}</span>
        </p>
      ) : null}

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
            className="tr-btn-primary cm-rental-submit disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconCart size={18} />
            {canSubmit
              ? isRentMode
                ? tr.booking.addToCart
                : `${tr.booking.buyNow} ${formatGel(displayTotal)}`
              : tr.booking.unavailable}
          </button>
        )}
      </CartForm>
    </div>
  );
}
