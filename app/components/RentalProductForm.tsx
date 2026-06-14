import {useEffect, useMemo, useState} from 'react';
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
  IconCart,
  IconMapPin,
  IconShield,
} from '~/components/trailrent/Icons';
import {RentalDateRangePicker} from '~/components/trailrent/RentalDateRangePicker';

export type FulfillmentMode = 'rent' | 'purchase';

export type RentToOwnOffer = {
  eligible: boolean;
  rentalCredit: number;
  buyNowPrice: number;
};

export type RentalProductFormProps = {
  rentVariantId: string;
  buyVariantId?: string;
  buyAvailable: boolean;
  /** Dedicated Buy variant exists — checkout charges correct purchase price. */
  buyCheckoutReady?: boolean;
  productTitle: string;
  dailyRate: number;
  purchasePrice: number;
  rentToOwnOffer?: RentToOwnOffer;
  isTrustedTier?: boolean;
  onSuccess?: () => void;
  onModeChange?: (mode: FulfillmentMode) => void;
  /** Hides duplicate product title when shown beside the page header. */
  compact?: boolean;
  /** Two-column booking layout for full-width solo product pages. */
  layout?: 'stacked' | 'wide';
};

function buildLineAttributes(options: {
  mode: FulfillmentMode;
  startDate: string;
  endDate: string;
  metroId: string;
  rentalCredit?: number;
  rentalDays?: number;
  quotedPurchasePrice?: number;
}): Array<{key: string; value: string}> {
  const {mode, startDate, endDate, metroId, rentalCredit, rentalDays, quotedPurchasePrice} = options;
  const isPurchase = mode === 'purchase';

  const attributes: Array<{key: string; value: string}> = [
    {key: 'fulfillment_mode', value: mode},
    {key: 'metro_station', value: metroId},
    {key: 'rent_to_own', value: isPurchase && rentalCredit ? 'true' : 'false'},
  ];

  if (isPurchase) {
    if (rentalCredit != null && rentalCredit > 0) {
      attributes.push({
        key: 'rental_credit_applied',
        value: String(rentalCredit),
      });
    }
    if (quotedPurchasePrice != null && quotedPurchasePrice > 0) {
      attributes.push({
        key: 'quoted_purchase_price',
        value: String(quotedPurchasePrice),
      });
    }
  } else {
    attributes.push(
      {key: 'rental_start', value: startDate},
      {key: 'rental_end', value: endDate},
      {key: 'rental_days', value: String(rentalDays ?? 1)},
    );
  }

  return attributes;
}

export function RentalProductForm({
  rentVariantId,
  buyVariantId,
  buyAvailable,
  buyCheckoutReady = false,
  productTitle,
  dailyRate,
  purchasePrice,
  rentToOwnOffer,
  isTrustedTier = false,
  onSuccess,
  onModeChange,
  compact = false,
  layout = 'stacked',
}: RentalProductFormProps) {
  const {translations: tr, locale} = useLocale();
  const defaults = getDefaultDateRange();

  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [metroId, setMetroId] = useState(METRO_STATIONS[0]?.id ?? '');
  const [mode, setMode] = useState<FulfillmentMode>('rent');

  const showBuyToggle = buyAvailable && purchasePrice > 0;
  const isRentMode = mode === 'rent';
  const hasRentToOwnCredit =
    rentToOwnOffer?.eligible === true &&
    (rentToOwnOffer.rentalCredit ?? 0) > 0;

  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  const datesValid = isDateRangeValid(startDate, endDate);
  const station = METRO_STATIONS.find((s) => s.id === metroId);

  const rentalPricing = useMemo(
    () => calculateRentalTotal(dailyRate, startDate, endDate),
    [dailyRate, startDate, endDate],
  );

  const activeVariantId = isRentMode ? rentVariantId : (buyVariantId ?? rentVariantId);
  const cartQuantity = isRentMode ? rentalPricing.days : 1;

  const buyDisplayTotal = hasRentToOwnCredit
    ? rentToOwnOffer!.buyNowPrice
    : purchasePrice;

  const cartLines: OptimisticCartLineInput[] = useMemo(
    () => [
      {
        merchandiseId: activeVariantId,
        quantity: cartQuantity,
        attributes: buildLineAttributes({
          mode,
          startDate,
          endDate,
          metroId,
          rentalCredit: hasRentToOwnCredit ? rentToOwnOffer?.rentalCredit : undefined,
          rentalDays: rentalPricing.days,
          quotedPurchasePrice:
            !isRentMode && !buyVariantId ? purchasePrice : undefined,
        }),
      },
    ],
    [
      activeVariantId,
      cartQuantity,
      mode,
      startDate,
      endDate,
      metroId,
      hasRentToOwnCredit,
      rentToOwnOffer?.rentalCredit,
      rentalPricing.days,
    ],
  );

  const canSubmit = isRentMode
    ? datesValid
    : showBuyToggle && purchasePrice > 0;

  const displayTotal = isRentMode ? rentalPricing.total : buyDisplayTotal;

  const setFulfillmentMode = (next: FulfillmentMode) => {
    setMode(next);
  };

  return (
    <div
      className={`cm-rental-form${compact ? ' cm-rental-form--compact' : ''}${layout === 'wide' ? ' cm-rental-form--wide' : ''}`}
    >
      <header className="cm-rental-form-header">
        <p className="cm-rental-form-eyebrow">{tr.booking.title}</p>
        {!compact ? (
          <h2 className="cm-rental-form-title">{productTitle}</h2>
        ) : null}
      </header>

      {showBuyToggle ? (
        <div
          className="cm-rental-mode-toggle"
          role="group"
          aria-label={`${tr.booking.modeRent} / ${tr.booking.modeBuy}`}
        >
          <button
            type="button"
            onClick={() => setFulfillmentMode('rent')}
            className={`cm-rental-mode-btn ${isRentMode ? 'cm-rental-mode-btn--active' : ''}`}
          >
            {tr.booking.modeRent}
          </button>
          <button
            type="button"
            onClick={() => setFulfillmentMode('purchase')}
            className={`cm-rental-mode-btn ${!isRentMode ? 'cm-rental-mode-btn--buy' : ''}`}
          >
            {tr.booking.modeBuy}
          </button>
        </div>
      ) : null}

      <div className="cm-rental-form-body">
        <div className="cm-rental-form-fields">
          {isRentMode ? (
            <div className="cm-rental-field">
              <RentalDateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>
          ) : (
            <div className="cm-rental-rto-banner">
              <p className="text-sm font-semibold text-pine">
                {tr.booking.buyOutright} {formatGel(buyDisplayTotal)}
              </p>
              {hasRentToOwnCredit ? (
                <>
                  <p className="mt-1 text-sm text-muted">
                    {tr.booking.rentalCredit}: −
                    {formatGel(rentToOwnOffer!.rentalCredit)} ·{' '}
                    {tr.booking.buyNowDiscount}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {tr.booking.rtoCheckoutNote}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted">{tr.booking.buyIncludesPickup}</p>
              )}
              {!buyCheckoutReady && purchasePrice > 0 ? (
                <p className="mt-2 text-xs leading-relaxed text-amber-800">
                  {tr.booking.buyVariantSetupHint}
                </p>
              ) : null}
            </div>
          )}

          <div className="cm-rental-field">
            <label htmlFor="rental-metro-select" className="cm-form-label">
              <span className="inline-flex items-center gap-2">
                <IconMapPin size={16} className="text-moss" />
                {isRentMode ? tr.booking.metro : tr.booking.pickupMetro}
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
        </div>

        <div className="cm-rental-form-checkout">
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
                <span>{tr.booking.purchasePrice}</span>
                <span>{formatGel(purchasePrice)}</span>
              </div>
            )}
            {hasRentToOwnCredit && !isRentMode ? (
              <div className="cm-rental-summary-row text-moss">
                <span>{tr.booking.rentalCredit}</span>
                <span>−{formatGel(rentToOwnOffer!.rentalCredit)}</span>
              </div>
            ) : null}
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
                    : `${tr.booking.addToCartBuy} · ${formatGel(purchasePrice)}`
                  : tr.booking.unavailable}
              </button>
            )}
          </CartForm>
        </div>
      </div>
    </div>
  );
}
