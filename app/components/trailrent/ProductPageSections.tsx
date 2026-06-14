import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {useLocale} from '~/providers/LocaleProvider';
import {formatGel} from '~/lib/trailrent/pricing';
import type {FulfillmentMode} from '~/components/RentalProductForm';
import {
  IconCheck,
  IconMetro,
  IconPackage,
  IconShield,
  IconStar,
} from '~/components/trailrent/Icons';

function moneyAmount(price?: MoneyV2): number | undefined {
  if (!price?.amount) return undefined;
  const amount = Number(price.amount);
  return Number.isFinite(amount) ? amount : undefined;
}

export function ProductPriceBlock({
  fulfillmentMode = 'rent',
  rentPrice,
  buyPrice,
  buyAvailable = false,
  compareAtPrice,
  savingsPercent,
}: {
  fulfillmentMode?: FulfillmentMode;
  rentPrice?: MoneyV2;
  buyPrice?: MoneyV2;
  buyAvailable?: boolean;
  compareAtPrice?: MoneyV2 | null;
  savingsPercent?: number;
}) {
  const {translations: tr} = useLocale();
  const rentAmount = moneyAmount(rentPrice);
  const buyAmount = moneyAmount(buyPrice);
  const compareAt = moneyAmount(compareAtPrice ?? undefined);
  const isPurchase = fulfillmentMode === 'purchase';
  const showKitCompare =
    compareAt != null &&
    compareAt > 0 &&
    !buyAvailable &&
    rentAmount != null &&
    compareAt > rentAmount;

  if (buyAvailable && buyAmount != null && rentAmount != null) {
    return (
      <div className="cm-product-price" aria-label="Price" role="group">
        <div className="cm-product-price-dual">
          <div
            className={`cm-product-price-chip${!isPurchase ? ' cm-product-price-chip--active' : ''}`}
          >
            <span className="cm-product-price-chip-label">{tr.booking.modeRent}</span>
            <p className="cm-product-price-chip-value">
              {formatGel(rentAmount)}
              <span className="cm-product-price-chip-unit">{tr.product.perDay}</span>
            </p>
          </div>
          <div
            className={`cm-product-price-chip cm-product-price-chip--buy${isPurchase ? ' cm-product-price-chip--active' : ''}`}
          >
            <span className="cm-product-price-chip-label">{tr.booking.modeBuy}</span>
            <p className="cm-product-price-chip-value">{formatGel(buyAmount)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cm-product-price" aria-label="Price" role="group">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
        {isPurchase && buyAmount != null ? (
          <p className="cm-price-amount">{formatGel(buyAmount)}</p>
        ) : rentAmount != null ? (
          <p className="cm-price-amount">
            {formatGel(rentAmount)}
            <span className="cm-price-suffix">{tr.product.perDay}</span>
          </p>
        ) : null}
        {showKitCompare && compareAtPrice ? (
          <p className="pb-1 text-lg text-muted line-through">
            {formatGel(compareAt!)}
          </p>
        ) : null}
      </div>
      {savingsPercent && !isPurchase ? (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber/20 px-3.5 py-1.5 text-sm font-semibold text-pine">
          <span className="rounded-full bg-amber px-2 py-0.5 text-xs font-bold text-pine">
            −{savingsPercent}%
          </span>
          {tr.product.kitSavings}
          {compareAt ? (
            <span className="font-normal text-muted">
              · {tr.product.wasPrice} {formatGel(compareAt)}
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

export function ProductTrustBar({isTrustedTier = false}: {isTrustedTier?: boolean}) {
  const {translations: tr} = useLocale();
  const items = [
    ...(!isTrustedTier
      ? [{Icon: IconShield, label: tr.trust.deposit, tone: 'moss' as const}]
      : []),
    {Icon: IconMetro, label: tr.trust.metro, tone: 'forest' as const},
    {Icon: IconStar, label: tr.trust.loyalty, tone: 'amber' as const},
  ];

  return (
    <ul className="cm-product-trust" role="list">
      {items.map(({Icon, label, tone}) => (
        <li key={label} className="cm-product-trust-item">
          <span
            className={`cm-product-trust-icon cm-product-trust-icon--${tone}`}
            aria-hidden
          >
            <Icon size={16} />
          </span>
          <span className="cm-product-trust-label">{label}</span>
        </li>
      ))}
    </ul>
  );
}

export function ProductIncludedPanel({items}: {items: string[]}) {
  const {translations: tr} = useLocale();
  if (!items.length) return null;

  return (
    <section
      className="cm-product-included"
      aria-labelledby="product-included-heading"
    >
      <div className="cm-product-included-header">
        <span className="cm-product-included-icon" aria-hidden>
          <IconPackage size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="cm-product-included-eyebrow">{tr.product.included}</p>
          <h2
            id="product-included-heading"
            className="cm-product-included-title"
          >
            {items.length} {tr.product.itemsIncluded}
          </h2>
        </div>
      </div>
      <div className="cm-product-included-body">
        <ul className="cm-product-included-list">
          {items.map((item) => (
            <li key={item} className="cm-product-included-item">
              <span className="cm-product-included-check" aria-hidden>
                <IconCheck size={12} />
              </span>
              <span className="cm-product-included-text">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ProductDescription({
  html,
  title,
}: {
  html: string;
  title: string;
}) {
  const {translations: tr} = useLocale();
  if (!html?.trim()) return null;

  return (
    <section className="cm-product-description" aria-labelledby="product-description-heading">
      <h2 id="product-description-heading" className="cm-product-description-title">
        {title || tr.product.about}
      </h2>
      <div
        className="cm-product-description-body"
        dangerouslySetInnerHTML={{__html: html}}
      />
    </section>
  );
}
