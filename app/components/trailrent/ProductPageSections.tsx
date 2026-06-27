import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {Link} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {useIsDesktop} from '~/hooks/useMediaQuery';
import {formatGel} from '~/lib/trailrent/pricing';
import {IncludedGearThumb} from '~/components/trailrent/IncludedGearThumb';
import type {FulfillmentMode} from '~/components/RentalProductForm';
import {PriceWithCompare} from '~/components/trailrent/PriceWithCompare';
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

/** Compact price beside the product title (left column). */
export function ProductInlinePrice({
  fulfillmentMode = 'rent',
  rentPrice,
  buyPrice,
  buyAvailable = false,
  compareAtPrice,
}: {
  fulfillmentMode?: FulfillmentMode;
  rentPrice?: MoneyV2;
  buyPrice?: MoneyV2;
  buyAvailable?: boolean;
  compareAtPrice?: MoneyV2 | null;
}) {
  const {translations: tr} = useLocale();
  const rentAmount = moneyAmount(rentPrice);
  const buyAmount = moneyAmount(buyPrice);
  const compareAt = moneyAmount(compareAtPrice ?? undefined);
  const isPurchase = fulfillmentMode === 'purchase';
  const showBuy =
    buyAvailable && buyAmount != null && buyAmount > 0 && isPurchase;
  const amount = showBuy ? buyAmount : rentAmount;
  if (amount == null) return null;

  const compareAtForDisplay =
    !showBuy && !buyAvailable ? compareAt : undefined;

  return (
    <PriceWithCompare
      amount={amount}
      compareAtAmount={compareAtForDisplay}
      suffix={!showBuy ? tr.product.perDay : undefined}
      size="pdp"
    />
  );
}

/** Discount banner and compare-at — under the inline price (left column). */
export function ProductPricingExtras({
  fulfillmentMode = 'rent',
  rentPrice,
  compareAtPrice,
  savingsPercent,
  buyAvailable = false,
  variant = 'default',
}: {
  fulfillmentMode?: FulfillmentMode;
  rentPrice?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  savingsPercent?: number;
  buyAvailable?: boolean;
  variant?: 'default' | 'inline';
}) {
  const {translations: tr} = useLocale();
  const rentAmount = moneyAmount(rentPrice);
  const compareAt = moneyAmount(compareAtPrice ?? undefined);
  const isPurchase = fulfillmentMode === 'purchase';
  const showKitCompare =
    compareAt != null &&
    compareAt > 0 &&
    !buyAvailable &&
    rentAmount != null &&
    compareAt > rentAmount;

  if (!showKitCompare && !(savingsPercent && !isPurchase)) return null;

  return (
    <div
      className={`cm-product-pricing-extras${variant === 'inline' ? ' cm-product-pricing-extras--inline' : ''}`}
    >
      {savingsPercent && !isPurchase ? (
        <p className="cm-product-pricing-savings">
          <span className="cm-product-pricing-savings-badge">
            −{savingsPercent}%
          </span>
          {tr.product.kitSavings}
        </p>
      ) : null}
    </div>
  );
}

export function ProductPriceBlock({
  fulfillmentMode = 'rent',
  rentPrice,
  buyPrice,
  buyAvailable = false,
  compareAtPrice: _compareAtPrice,
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
  const isPurchase = fulfillmentMode === 'purchase';
  const showBuyChip =
    buyAvailable && buyAmount != null && buyAmount > 0 && rentAmount != null;
  const isRentActive = !isPurchase || !showBuyChip;
  const isBuyActive = isPurchase && showBuyChip;

  if (rentAmount == null && buyAmount == null) return null;

  return (
    <div className="cm-product-price" aria-label="Price" role="group">
      <div
        className={`cm-product-price-dual${!showBuyChip ? ' cm-product-price-dual--rent-only' : ''}`}
      >
        {rentAmount != null ? (
          <div
            className={`cm-product-price-chip${isRentActive ? ' cm-product-price-chip--active' : ''}`}
          >
            <span className="cm-product-price-chip-label">{tr.booking.modeRent}</span>
            <p className="cm-product-price-chip-value">
              {formatGel(rentAmount)}
              <span className="cm-product-price-chip-unit">{tr.product.perDay}</span>
            </p>
          </div>
        ) : null}
        {showBuyChip ? (
          <div
            className={`cm-product-price-chip cm-product-price-chip--buy${isBuyActive ? ' cm-product-price-chip--active' : ''}`}
          >
            <span className="cm-product-price-chip-label">{tr.booking.modeBuy}</span>
            <p className="cm-product-price-chip-value">{formatGel(buyAmount!)}</p>
          </div>
        ) : null}
      </div>
      {savingsPercent && !isPurchase ? (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber/20 px-3.5 py-1.5 text-sm font-semibold text-pine">
          <span className="rounded-full bg-amber px-2 py-0.5 text-xs font-bold text-pine">
            −{savingsPercent}%
          </span>
          {tr.product.kitSavings}
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

export type ProductIncludedItem = {
  title: string;
  handle?: string;
  imageUrl?: string;
  dailyRate?: number;
};

export function ProductIncludedPanel({
  items,
  includedProducts,
  variant = 'default',
  embedded = false,
}: {
  items: string[];
  includedProducts?: ProductIncludedItem[];
  variant?: 'default' | 'editorial' | 'package';
  /** Lighter chrome when rendered inside the package booking grid. */
  embedded?: boolean;
}) {
  const {translations: tr, locale} = useLocale();
  const isDesktop = useIsDesktop();
  const entries: ProductIncludedItem[] = includedProducts?.length
    ? includedProducts
    : items.map((title) => ({title}));
  if (!entries.length) return null;

  const isEditorial = variant === 'editorial';
  const isPackage = variant === 'package';
  const sectionTitle = isPackage
    ? tr.product.includedKitTitle
    : locale === 'ka'
      ? 'რა შედის ნაკრებში'
      : "What's Included";

  const previewNames = entries
    .slice(0, 2)
    .map((entry) => entry.title)
    .join(', ');
  const previewMore =
    entries.length > 2
      ? tr.product.includedMore.replace('{count}', String(entries.length - 2))
      : null;

  if (isPackage && embedded) {
    return (
      <details
        className="cm-package-included cm-package-included--embedded"
        open={isDesktop || undefined}
      >
        <summary className="cm-package-included__summary">
          <span className="cm-package-included__icon" aria-hidden>
            <IconPackage size={16} />
          </span>
          <span className="cm-package-included__copy">
            <span className="cm-package-included__title">{sectionTitle}</span>
            <span className="cm-package-included__meta">
              {entries.length} {tr.product.itemsIncluded}
              {previewNames ? (
                <>
                  <span aria-hidden> · </span>
                  <span className="cm-package-included__preview">{previewNames}</span>
                </>
              ) : null}
            </span>
          </span>
          <span className="cm-package-included__chevron" aria-hidden />
        </summary>
        <div className="cm-package-included__body">
          <ul className="cm-package-included__list" role="list">
            {entries.map((entry) => {
              const href = entry.handle ? `/products/${entry.handle}` : undefined;
              const row = (
                <>
                  <span className="cm-package-included__thumb">
                    {entry.imageUrl ? (
                      <img src={entry.imageUrl} alt="" loading="lazy" />
                    ) : (
                      <span aria-hidden>{entry.title.slice(0, 2).toUpperCase()}</span>
                    )}
                  </span>
                  <span className="cm-package-included__label" title={entry.title}>
                    {entry.title}
                  </span>
                </>
              );

              return (
                <li key={entry.handle ?? entry.title}>
                  {href ? (
                    <Link
                      to={href}
                      className="cm-package-included__row no-underline hover:no-underline"
                      prefetch="intent"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className="cm-package-included__row">{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </details>
    );
  }

  if (isPackage) {
    return (
      <details
        className={`cm-included-disclosure${embedded ? ' cm-included-disclosure--embedded' : ''}`}
        open={isDesktop}
      >
        <summary className="cm-included-disclosure__summary">
          <span className="cm-included-disclosure__icon" aria-hidden>
            <IconPackage size={16} />
          </span>
          <span className="cm-included-disclosure__copy">
            <span className="cm-included-disclosure__title">{sectionTitle}</span>
            <span className="cm-included-disclosure__meta">
              {entries.length} {tr.product.itemsIncluded}
              {previewNames ? (
                <>
                  <span aria-hidden> · </span>
                  <span className="cm-included-disclosure__preview">
                    {previewNames}
                    {previewMore ? ` ${previewMore}` : ''}
                  </span>
                </>
              ) : null}
            </span>
          </span>
          <span className="cm-included-disclosure__chevron" aria-hidden />
        </summary>
        <div className="cm-included-disclosure__body">
          <ul className="cm-included-disclosure__list" role="list">
            {entries.map((entry) => {
              const href = entry.handle ? `/products/${entry.handle}` : undefined;
              const row = (
                <>
                  <span className="cm-included-disclosure__thumb">
                    {entry.imageUrl ? (
                      <img src={entry.imageUrl} alt="" loading="lazy" />
                    ) : (
                      <span aria-hidden>{entry.title.slice(0, 2).toUpperCase()}</span>
                    )}
                  </span>
                  <span className="cm-included-disclosure__label" title={entry.title}>
                    {entry.title}
                  </span>
                </>
              );

              return (
                <li key={entry.handle ?? entry.title}>
                  {href ? (
                    <Link
                      to={href}
                      className="cm-included-disclosure__row no-underline hover:no-underline"
                      prefetch="intent"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className="cm-included-disclosure__row">{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </details>
    );
  }

  return (
    <section
      className={
        isEditorial ? 'cm-pdp-section cm-pdp-section--included' : 'cm-product-included'
      }
      aria-labelledby="product-included-heading"
    >
      {isEditorial ? (
        <div className="cm-pdp-section__head">
          <h2 id="product-included-heading" className="cm-pdp-section__title">
            {sectionTitle}
          </h2>
        </div>
      ) : (
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
              {entries.length} {tr.product.itemsIncluded}
            </h2>
          </div>
        </div>
      )}
      <div
        className={
          isEditorial ? 'cm-pdp-section__body' : 'cm-product-included-body'
        }
      >
        {isEditorial ? (
          <ul className="cm-product-included-kit__list" role="list">
            {entries.map((entry) => {
              const href = entry.handle ? `/products/${entry.handle}` : undefined;
              const cardContent = (
                <>
                  <span className="cm-product-included-kit__media">
                    {entry.imageUrl ? (
                      <img
                        src={entry.imageUrl}
                        alt=""
                        loading="lazy"
                        className="cm-product-included-kit__image"
                      />
                    ) : (
                      <span className="cm-product-included-kit__fallback" aria-hidden>
                        {entry.title.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="cm-product-included-kit__label" title={entry.title}>
                    {entry.title}
                  </span>
                </>
              );

              return (
                <li key={entry.handle ?? entry.title} className="cm-product-included-kit__item">
                  {href ? (
                    <Link
                      to={href}
                      className="cm-product-included-kit__card no-underline hover:no-underline"
                      prefetch="intent"
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <div className="cm-product-included-kit__card">{cardContent}</div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <>
            {entries.some((entry) => entry.imageUrl) ? (
              <div className="cm-product-included-thumbs" role="list">
                {entries.map((entry) => (
                  <IncludedGearThumb
                    key={entry.handle ?? entry.title}
                    item={entry}
                    thumbClassName="cm-product-included-thumb no-underline hover:no-underline"
                    href={entry.handle ? `/products/${entry.handle}` : undefined}
                    listItem
                  />
                ))}
              </div>
            ) : null}
            <ul className="cm-product-included-list">
              {entries.map((entry) => (
                <li
                  key={entry.handle ?? entry.title}
                  className="cm-product-included-item"
                >
                  <span className="cm-product-included-check" aria-hidden>
                    <IconCheck size={12} />
                  </span>
                  <span className="cm-product-included-text">{entry.title}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

export function ProductTechnicalSpecs({
  html,
  variant = 'default',
}: {
  html: string;
  variant?: 'default' | 'editorial';
}) {
  const {locale} = useLocale();
  if (!html?.trim()) return null;

  const title =
    locale === 'ka' ? 'ტექნიკური მახასიათებლები' : 'Technical Specs';

  if (variant === 'editorial') {
    return (
      <section
        className="cm-pdp-specs-panel"
        aria-labelledby="product-specs-heading"
      >
        <h2 id="product-specs-heading" className="cm-pdp-specs-panel__title">
          {title}
        </h2>
        <div
          className="cm-pdp-specs-panel__content"
          dangerouslySetInnerHTML={{__html: html}}
        />
      </section>
    );
  }

  return (
    <section className="cm-pdp-section" aria-labelledby="product-specs-heading">
      <div className="cm-pdp-section__head">
        <h2 id="product-specs-heading" className="cm-pdp-section__title">
          {title}
        </h2>
      </div>
      <div
        className="cm-pdp-section__body cm-product-description-body"
        dangerouslySetInnerHTML={{__html: html}}
      />
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
