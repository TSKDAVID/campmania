import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {Money} from '@shopify/hydrogen';
import {useLocale} from '~/providers/LocaleProvider';
import {formatGel} from '~/lib/trailrent/pricing';
import {
  IconCheck,
  IconMetro,
  IconPackage,
  IconShield,
  IconStar,
} from '~/components/trailrent/Icons';

export function ProductPriceBlock({
  price,
  compareAtPrice,
  savingsPercent,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  savingsPercent?: number;
}) {
  const {translations: tr} = useLocale();
  const compareAt = compareAtPrice
    ? Number(compareAtPrice.amount)
    : undefined;

  return (
    <div className="cm-product-price" aria-label="Price" role="group">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
        {price ? (
          <p className="cm-price-amount">
            <Money data={price} />
            <span className="cm-price-suffix">{tr.product.perDay}</span>
          </p>
        ) : null}
        {compareAtPrice && compareAt && compareAt > 0 ? (
          <p className="pb-1 text-lg text-muted line-through">
            <Money data={compareAtPrice} />
          </p>
        ) : null}
      </div>
      {savingsPercent ? (
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
