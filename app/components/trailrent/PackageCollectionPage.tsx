import {useMemo, useState, type ReactNode} from 'react';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {CartForm} from '@shopify/hydrogen';
import {ProductImage, type GalleryImage} from '~/components/ProductImage';
import {
  RentalProductForm,
  type FulfillmentMode,
  buildRentalLineAttributes,
} from '~/components/RentalProductForm';
import {
  ProductIncludedPanel,
  ProductInlinePrice,
  ProductPricingExtras,
  type ProductIncludedItem,
} from '~/components/trailrent/ProductPageSections';
import {useLocale} from '~/providers/LocaleProvider';
import type {
  CatalogProductNode,
  PackageCollectionDetail,
} from '~/lib/trailrent/shopify-catalog';
import {mapCatalogNodeToGearBuilderProduct} from '~/lib/trailrent/shopify-catalog';
import {
  buildTrailPackageKitCartLines,
} from '~/lib/trailrent/package-cart';
import {
  calculateRentalTotal,
  formatGel,
  getDefaultDateRange,
  isDateRangeValid,
} from '~/lib/trailrent/pricing';
import {
  TBILISI_METRO_STATIONS,
  type DeliveryOption,
} from '~/components/trailrent/DeliverySelector';
import {RentalDateRangePicker} from '~/components/trailrent/RentalDateRangePicker';
import {getCartActionErrorMessage} from '~/lib/trailrent/cart-display';
import {isTrustedTier} from '~/lib/trailrent/loyalty';
import type {CustomerRentalContext} from '~/lib/trailrent/customer-rental-context';
import {
  collectProductVariants,
  coalesceMetafieldValue,
  metafieldValueByKeys,
  packageBuyAvailable,
  resolveFulfillmentVariants,
  sumPackagePurchasePrice,
} from '~/lib/trailrent/product-variants';
import {IconCart} from '~/components/trailrent/Icons';

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-moss/15 text-moss border-moss/25',
  moderate: 'bg-amber/15 text-forest border-amber/30',
  hard: 'bg-pine/10 text-pine border-pine/20',
};

function PackageKitBookingForm({
  pkg,
  discountPercent,
  compareAtDaily,
  purchasePrice,
  buyAvailable,
  priceSlot,
  includedSlot,
}: {
  pkg: PackageCollectionDetail['package'];
  discountPercent?: number;
  compareAtDaily?: number;
  purchasePrice: number;
  buyAvailable: boolean;
  priceSlot?: ReactNode;
  includedSlot?: ReactNode;
}) {
  const {translations: tr} = useLocale();
  const defaults = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const deliveryOption: DeliveryOption = 'metro';
  const metroId = TBILISI_METRO_STATIONS[0]?.id ?? 'rustaveli';
  const deliveryFee = 0;

  const rentalPricing = useMemo(
    () => calculateRentalTotal(pkg.dailyRate, startDate, endDate),
    [pkg.dailyRate, startDate, endDate],
  );
  const datesValid = isDateRangeValid(startDate, endDate);

  const cartLines = useMemo(
    () =>
      buildTrailPackageKitCartLines({
        kitProducts: pkg.includedCollectionProducts,
        collectionHandle: pkg.packageCollectionHandle ?? pkg.id,
        packageTitle: pkg.title,
        discountPercent: discountPercent ?? 0,
        rentalDays: rentalPricing.days,
        lineAttributes: buildRentalLineAttributes({
          mode: 'rent',
          startDate,
          endDate,
          deliveryOption,
          metroId,
          deliveryAddress: '',
          deliveryFee,
          rentalDays: rentalPricing.days,
        }),
        packageDailyRate: pkg.dailyRate,
      }),
    [
      pkg,
      discountPercent,
      startDate,
      endDate,
      deliveryOption,
      metroId,
      deliveryFee,
      rentalPricing.days,
    ],
  );

  const canSubmit = cartLines.length > 0 && datesValid;

  const submitButton = (fetcher: {state: string; data?: unknown}) => {
    const addError = getCartActionErrorMessage(fetcher.data);
    const label = canSubmit ? tr.gearBuilder.addBundleToCart : tr.booking.unavailable;

    return (
      <div className="cm-rental-form-actions cm-rental-form-actions--package">
        {addError ? (
          <p className="cm-rental-status cm-rental-status--error" role="alert">
            {addError}
          </p>
        ) : null}
        <button
          type="submit"
          className="tr-btn-primary cm-rental-submit cm-rental-submit--package disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSubmit || fetcher.state !== 'idle'}
        >
          <IconCart size={16} />
          {label}
        </button>
      </div>
    );
  };

  return (
    <div className="cm-rental-form cm-rental-form--compact cm-rental-form--package">
      <header className="cm-rental-form-header">
        <div className="cm-rental-form-header__lead">
          {priceSlot ? (
            <div className="cm-rental-form-price">{priceSlot}</div>
          ) : null}
        </div>
      </header>

      <div className="cm-rental-form-body">
        <CartForm
          route="/cart"
          inputs={{lines: cartLines}}
          action={CartForm.ACTIONS.LinesAdd}
        >
          {(fetcher) => (
            <div className="cm-package-booking-panel">
              <div className="cm-package-booking-panel__main">
                <div className="cm-package-booking-panel__dates">
                  <RentalDateRangePicker
                    layout="package"
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    totalAmount={formatGel(rentalPricing.total)}
                  />
                </div>
                {includedSlot ? (
                  <div className="cm-package-booking-panel__included">
                    {includedSlot}
                  </div>
                ) : null}
              </div>
              <div className="cm-package-booking-panel__footer">
                {submitButton(fetcher)}
              </div>
            </div>
          )}
        </CartForm>
        {buyAvailable && purchasePrice > 0 ? (
          <p className="cm-rental-package-buy-note">
            {tr.booking.buyOutright} {formatGel(purchasePrice)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function PackageCollectionPage({
  detail,
  customerRentalContext,
}: {
  detail: PackageCollectionDetail;
  customerRentalContext: CustomerRentalContext;
}) {
  const {locale, translations: tr} = useLocale();
  const {package: pkg, linkedProduct, kitNodes} = detail;
  const [fulfillmentMode, setFulfillmentMode] =
    useState<FulfillmentMode>('rent');

  const includedProducts = useMemo((): ProductIncludedItem[] => {
    return kitNodes.map((node) => {
      const product = mapCatalogNodeToGearBuilderProduct(node);
      return {
        title: product.title,
        handle: product.handle,
        imageUrl: product.imageUrl,
        dailyRate: product.dailyRate,
      };
    });
  }, [kitNodes]);

  const galleryImages = useMemo((): GalleryImage[] => {
    const urls = pkg.imageUrls?.length
      ? pkg.imageUrls
      : pkg.imageUrl
        ? [pkg.imageUrl]
        : [];
    return urls.map((url, index) => ({
      id: `${pkg.id}-${index}`,
      url,
      altText: pkg.imageAlt ?? pkg.title,
    }));
  }, [pkg]);

  const fulfillment = useMemo(() => {
    if (!linkedProduct) return null;
    const variants = collectProductVariants(linkedProduct as CatalogProductNode);
    const product = linkedProduct as CatalogProductNode & {
      fulfillmentMetafields?: Array<{key: string; value: string}>;
      availableForPurchase?: {value: string};
      availableForPurchaseAlt?: {value: string};
      purchasePriceMeta?: {value: string};
      purchasePriceMetaAlt?: {value: string};
    };
    const availableMeta = coalesceMetafieldValue(
      metafieldValueByKeys(product.fulfillmentMetafields ?? [], [
        'available-to-purchase',
        'available_for_purchase',
      ]),
      product.availableForPurchase?.value,
      product.availableForPurchaseAlt?.value,
    );
    const purchaseMeta = coalesceMetafieldValue(
      metafieldValueByKeys(product.fulfillmentMetafields ?? [], [
        'purchase-price',
        'purchase_price',
      ]),
      product.purchasePriceMeta?.value,
      product.purchasePriceMetaAlt?.value,
    );
    return resolveFulfillmentVariants({
      variants,
      availableForPurchaseMeta: availableMeta,
      purchasePriceMeta: purchaseMeta,
    });
  }, [linkedProduct]);

  const rentVariant = fulfillment?.rentVariant;
  const buyVariant = fulfillment?.buyVariant;
  const kitBuyAvailable = packageBuyAvailable(kitNodes as never);
  const buyAvailable = kitBuyAvailable;
  const purchasePrice = buyAvailable
    ? sumPackagePurchasePrice(kitNodes as never)
    : 0;
  const displayDailyRate = pkg.dailyRate;
  const displayCompareAt = pkg.compareAtPrice ?? 0;
  const savingsPercent = pkg.savingsPercent;
  const diffStyle =
    DIFFICULTY_STYLES[pkg.difficulty] ?? 'bg-stone text-muted';

  const displayRentPrice: MoneyV2 | undefined =
    displayDailyRate > 0
      ? {
          amount: String(displayDailyRate),
          currencyCode: 'GEL',
        }
      : undefined;
  const displayCompareAtPrice: MoneyV2 | undefined =
    displayCompareAt > displayDailyRate
      ? {
          amount: String(displayCompareAt),
          currencyCode: 'GEL',
        }
      : undefined;
  const buyPriceMoney: MoneyV2 | undefined =
    purchasePrice > 0
      ? {amount: String(purchasePrice), currencyCode: 'GEL'}
      : undefined;

  const trustedTier = isTrustedTier(
    customerRentalContext.tags,
    customerRentalContext.orders,
  );

  const bookingFormProps = rentVariant?.id
    ? {
        rentVariantId: rentVariant.id,
        rentVariantAvailable: rentVariant.availableForSale !== false,
        rentSellableQuantity:
          rentVariant.quantityAvailable != null
            ? rentVariant.quantityAvailable
            : undefined,
        buyVariantId: buyVariant?.id,
        buyAvailable,
        buyCheckoutReady: fulfillment?.buyCheckoutReady ?? false,
        productTitle: pkg.title,
        dailyRate: displayDailyRate,
        compareAtDailyRate:
          displayCompareAt > displayDailyRate ? displayCompareAt : undefined,
        purchasePrice,
        isTrustedTier: trustedTier,
        onModeChange: setFulfillmentMode,
      }
    : null;

  const subtitle =
    pkg.description?.trim() ||
    (locale === 'ka'
      ? `${pkg.trekLabel} · ${pkg.durationLabel}`
      : `${pkg.trekLabel} · ${pkg.durationLabel}`);

  const priceSlot = (
    <>
      <ProductInlinePrice
        fulfillmentMode={fulfillmentMode}
        rentPrice={displayRentPrice}
        buyPrice={buyPriceMoney}
        buyAvailable={buyAvailable}
        compareAtPrice={displayCompareAtPrice}
      />
      <ProductPricingExtras
        fulfillmentMode={fulfillmentMode}
        rentPrice={displayRentPrice}
        compareAtPrice={displayCompareAtPrice}
        savingsPercent={savingsPercent}
        buyAvailable={buyAvailable}
        variant="inline"
      />
    </>
  );

  const embedIncludedInBooking =
    !bookingFormProps || fulfillmentMode === 'rent';
  const packageIncludedPanel =
    includedProducts.length > 0 ? (
      <ProductIncludedPanel
        items={pkg.items}
        includedProducts={includedProducts}
        variant="package"
        embedded={embedIncludedInBooking}
      />
    ) : null;

  return (
    <article className="cm-product-page cm-pdp-editorial cm-pdp-editorial--package">
      <div className="cm-pdp-editorial__inner">
        <div className="cm-pdp-editorial__grid">
          <aside className="cm-pdp-editorial__media" aria-label={pkg.title}>
            <ProductImage
              images={galleryImages}
              title={pkg.title}
              variant="kit"
            />
          </aside>

          <div className="cm-pdp-editorial__details">
            <header>
              <p className="cm-pdp-editorial__eyebrow">{tr.packages.eyebrow}</p>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="cm-pdp-editorial__title">{pkg.title}</h1>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${diffStyle}`}
                >
                  {pkg.difficultyLabel}
                </span>
              </div>
              <p className="cm-kit-card-meta mt-2">
                <span>{pkg.trekLabel}</span>
                <span aria-hidden> · </span>
                <span>{pkg.durationLabel}</span>
              </p>
              {subtitle ? (
                <p className="cm-editorial-body mt-2">{subtitle}</p>
              ) : null}
            </header>

            <div className="cm-product-booking">
              {bookingFormProps ? (
                <RentalProductForm
                  {...bookingFormProps}
                  layout="stacked"
                  compact
                  packageBooking
                  priceSlot={priceSlot}
                  includedSlot={
                    embedIncludedInBooking ? packageIncludedPanel : undefined
                  }
                />
              ) : (
                <PackageKitBookingForm
                  pkg={pkg}
                  discountPercent={savingsPercent}
                  compareAtDaily={displayCompareAt}
                  purchasePrice={purchasePrice}
                  buyAvailable={buyAvailable}
                  priceSlot={priceSlot}
                  includedSlot={packageIncludedPanel}
                />
              )}
            </div>

            {includedProducts.length > 0 && !embedIncludedInBooking ? (
              <ProductIncludedPanel
                items={pkg.items}
                includedProducts={includedProducts}
                variant="package"
              />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
