import {useEffect, useMemo, useState} from 'react';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useLocale} from '~/providers/LocaleProvider';
import {
  calculateRentalTotal,
  formatGel,
  getDefaultDateRange,
  isDateRangeValid,
} from '~/lib/trailrent/pricing';
import {
  IconCart,
  IconShield,
} from '~/components/trailrent/Icons';
import {RentalDateRangePicker} from '~/components/trailrent/RentalDateRangePicker';
import {
  DeliverySelector,
  HOME_DELIVERY_FEE,
  TBILISI_METRO_STATIONS,
  type DeliveryOption,
} from '~/components/trailrent/DeliverySelector';
import {getCartActionErrorMessage} from '~/lib/trailrent/cart-display';

export type FulfillmentMode = 'rent' | 'purchase';

export type RentToOwnOffer = {
  eligible: boolean;
  rentalCredit: number;
  buyNowPrice: number;
};

export type RentalProductFormProps = {
  rentVariantId: string;
  rentVariantAvailable?: boolean;
  /** Max units Shopify allows in cart (rental days must not exceed this when tracked). */
  rentSellableQuantity?: number;
  buyVariantId?: string;
  buyAvailable: boolean;
  /** Dedicated Buy variant exists — checkout charges correct purchase price. */
  buyCheckoutReady?: boolean;
  productTitle: string;
  dailyRate: number;
  /** Compare-at daily rate shown on PDP (kit subtotal before bundle discount). */
  compareAtDailyRate?: number;
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
  deliveryOption: DeliveryOption;
  metroId: string;
  deliveryAddress: string;
  deliveryFee: number;
  rentalCredit?: number;
  rentalDays?: number;
  quotedPurchasePrice?: number;
  quotedDailyRate?: number;
  quotedCompareAtDaily?: number;
}): Array<{key: string; value: string}> {
  const {
    mode,
    startDate,
    endDate,
    deliveryOption,
    metroId,
    deliveryAddress,
    deliveryFee,
    rentalCredit,
    rentalDays,
    quotedPurchasePrice,
    quotedDailyRate,
    quotedCompareAtDaily,
  } = options;
  const isPurchase = mode === 'purchase';

  const attributes: Array<{key: string; value: string}> = [
    {key: 'fulfillment_mode', value: mode},
    {key: 'delivery_method', value: deliveryOption},
    {key: 'delivery_fee', value: String(deliveryFee)},
    {key: 'rent_to_own', value: isPurchase && rentalCredit ? 'true' : 'false'},
  ];

  if (deliveryOption === 'metro') {
    attributes.push({key: 'metro_station', value: metroId});
  } else if (deliveryAddress.trim()) {
    attributes.push({key: 'delivery_address', value: deliveryAddress.trim()});
  }

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
    if (quotedDailyRate != null && quotedDailyRate > 0) {
      attributes.push({
        key: 'quoted_daily_rate',
        value: String(quotedDailyRate),
      });
    }
    if (
      quotedCompareAtDaily != null &&
      quotedCompareAtDaily > 0 &&
      quotedDailyRate != null &&
      quotedCompareAtDaily > quotedDailyRate
    ) {
      attributes.push({
        key: 'quoted_compare_at_daily',
        value: String(quotedCompareAtDaily),
      });
    }
  }

  return attributes;
}

export function RentalProductForm({
  rentVariantId,
  rentVariantAvailable = true,
  rentSellableQuantity,
  buyVariantId,
  buyAvailable,
  buyCheckoutReady = false,
  productTitle,
  dailyRate,
  compareAtDailyRate,
  purchasePrice,
  rentToOwnOffer,
  isTrustedTier = false,
  onSuccess,
  onModeChange,
  compact = false,
  layout = 'stacked',
}: RentalProductFormProps) {
  const {translations: tr} = useLocale();
  const defaults = getDefaultDateRange();

  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('metro');
  const [metroId, setMetroId] = useState(
    TBILISI_METRO_STATIONS[0]?.id ?? 'rustaveli',
  );
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [mode, setMode] = useState<FulfillmentMode>('rent');

  const showBuyToggle = buyAvailable && purchasePrice > 0;
  const isRentMode = mode === 'rent';
  const deliveryFee =
    deliveryOption === 'home' && isRentMode ? HOME_DELIVERY_FEE : 0;
  const hasRentToOwnCredit =
    rentToOwnOffer?.eligible === true &&
    (rentToOwnOffer.rentalCredit ?? 0) > 0;

  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  const datesValid = isDateRangeValid(startDate, endDate);
  const deliveryReady =
    deliveryOption === 'metro' || deliveryAddress.trim().length > 0;

  const rentalPricing = useMemo(
    () => calculateRentalTotal(dailyRate, startDate, endDate),
    [dailyRate, startDate, endDate],
  );

  const activeVariantId = isRentMode ? rentVariantId : (buyVariantId ?? rentVariantId);
  // Daily rate × rental days — Shopify line quantity matches billable days.
  const cartQuantity = isRentMode ? rentalPricing.days : 1;
  const rentExceedsInventory =
    isRentMode &&
    rentSellableQuantity != null &&
    rentSellableQuantity >= 0 &&
    rentalPricing.days > rentSellableQuantity;

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
          deliveryOption,
          metroId,
          deliveryAddress,
          deliveryFee,
          rentalCredit: hasRentToOwnCredit ? rentToOwnOffer?.rentalCredit : undefined,
          rentalDays: rentalPricing.days,
          quotedPurchasePrice:
            !isRentMode && !buyVariantId ? purchasePrice : undefined,
          quotedDailyRate: isRentMode ? dailyRate : undefined,
          quotedCompareAtDaily:
            isRentMode &&
            compareAtDailyRate != null &&
            compareAtDailyRate > dailyRate
              ? compareAtDailyRate
              : undefined,
        }),
      },
    ],
    [
      activeVariantId,
      buyVariantId,
      cartQuantity,
      mode,
      startDate,
      endDate,
      deliveryOption,
      metroId,
      deliveryAddress,
      deliveryFee,
      hasRentToOwnCredit,
      isRentMode,
      rentToOwnOffer?.rentalCredit,
      rentalPricing.days,
      dailyRate,
      compareAtDailyRate,
      purchasePrice,
    ],
  );

  const canSubmit = isRentMode
    ? rentVariantAvailable &&
      !rentExceedsInventory &&
      datesValid &&
      deliveryReady
    : showBuyToggle && purchasePrice > 0;

  const displayTotal = isRentMode
    ? rentalPricing.total + deliveryFee
    : buyDisplayTotal;

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
          <div className="cm-rental-mode-slot">
            <div
              className={`cm-rental-mode-panel${isRentMode ? ' cm-rental-mode-panel--active' : ''}`}
              aria-hidden={!isRentMode}
            >
              <div className="cm-rental-field cm-rental-field--mode">
                <RentalDateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
              </div>
            </div>
            <div
              className={`cm-rental-mode-panel${!isRentMode ? ' cm-rental-mode-panel--active' : ''}`}
              aria-hidden={isRentMode}
            >
              <div className="cm-rental-rto-banner cm-rental-field--mode">
                <p className="text-sm font-semibold text-pine">
                  {tr.booking.buyOutright}{' '}
                  <span className="text-lg tabular-nums">{formatGel(buyDisplayTotal)}</span>
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
            </div>
          </div>

          <div className="cm-rental-field">
            <DeliverySelector
              option={deliveryOption}
              onOptionChange={setDeliveryOption}
              metroStationId={metroId}
              onMetroStationChange={setMetroId}
              address={deliveryAddress}
              onAddressChange={setDeliveryAddress}
            />
          </div>
        </div>

        <div className="cm-rental-form-checkout">
          <div className="cm-rental-summary">
            <div className="cm-rental-summary-rows">
              {isRentMode ? (
                <>
                  <div className="cm-rental-summary-row">
                    <span>{tr.booking.dailyRate}</span>
                    <span className="cm-rental-summary-amount">{formatGel(dailyRate)}</span>
                  </div>
                  <div className="cm-rental-summary-row">
                    <span>
                      {rentalPricing.days} {tr.booking.days}
                    </span>
                    <span className="cm-rental-summary-amount">
                      {formatGel(rentalPricing.subtotal)}
                    </span>
                  </div>
                  {deliveryFee > 0 ? (
                    <div className="cm-rental-summary-row">
                      <span>{tr.pages.delivery}</span>
                      <span className="cm-rental-summary-amount">
                        {formatGel(deliveryFee)}
                      </span>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="cm-rental-summary-row">
                  <span>{tr.booking.purchasePrice}</span>
                  <span className="cm-rental-summary-amount">{formatGel(purchasePrice)}</span>
                </div>
              )}
            </div>
            {hasRentToOwnCredit && !isRentMode ? (
              <div className="cm-rental-summary-row text-moss">
                <span>{tr.booking.rentalCredit}</span>
                <span className="cm-rental-summary-amount">
                  −{formatGel(rentToOwnOffer!.rentalCredit)}
                </span>
              </div>
            ) : null}
            <div className="cm-rental-summary-total">
              <span>{tr.booking.total}</span>
              <span className="cm-rental-summary-total-amount">{formatGel(displayTotal)}</span>
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
            {(fetcher) => {
              const addError = getCartActionErrorMessage(fetcher.data);
              return (
                <>
                  {!rentVariantAvailable && isRentMode ? (
                    <p className="cm-rental-status cm-rental-status--error">
                      {tr.booking.rentUnavailable}
                    </p>
                  ) : null}
                  {rentExceedsInventory ? (
                    <p className="cm-rental-status cm-rental-status--error">
                      {tr.booking.rentInventoryLimit.replace(
                        '{days}',
                        String(rentSellableQuantity),
                      )}
                    </p>
                  ) : null}
                  {addError ? (
                    <p className="cm-rental-status cm-rental-status--error" role="alert">
                      {addError}
                    </p>
                  ) : null}
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
                    {!rentVariantAvailable && isRentMode
                      ? tr.booking.unavailable
                      : canSubmit
                        ? isRentMode
                          ? tr.booking.addToCart
                          : `${tr.booking.addToCartBuy} · ${formatGel(purchasePrice)}`
                        : tr.booking.unavailable}
                  </button>
                </>
              );
            }}
          </CartForm>
        </div>
      </div>
    </div>
  );
}
