import type {ReactNode} from 'react';
import {formatGel} from '~/lib/trailrent/pricing';

export type PriceWithCompareSize = 'pdp' | 'catalog' | 'compact';

export function shouldShowCompareAt(
  amount: number,
  compareAtAmount?: number | null,
): boolean {
  return (
    compareAtAmount != null &&
    compareAtAmount > 0 &&
    Number.isFinite(amount) &&
    compareAtAmount > amount
  );
}

/** Strikethrough compare-at before current price — shared across PDP, catalog, search. */
export function PriceWithCompare({
  amount,
  compareAtAmount,
  suffix,
  size = 'catalog',
  className,
  compareLabel,
}: {
  amount: number;
  compareAtAmount?: number | null;
  suffix?: ReactNode;
  size?: PriceWithCompareSize;
  className?: string;
  /** Screen-reader label for the compare-at value (catalog cards). */
  compareLabel?: string;
}) {
  const showCompare = shouldShowCompareAt(amount, compareAtAmount);

  if (size === 'pdp') {
    return (
      <div
        className={`cm-product-inline-price${className ? ` ${className}` : ''}`}
        aria-label="Price"
      >
        {showCompare ? (
          <span className="cm-price-compare" aria-hidden>
            {formatGel(compareAtAmount!)}
          </span>
        ) : null}
        <span className="cm-price-amount">{formatGel(amount)}</span>
        {suffix ? <span className="cm-price-suffix">{suffix}</span> : null}
      </div>
    );
  }

  if (size === 'compact') {
    return (
      <span className={`cm-price-with-compare cm-price-with-compare--compact${className ? ` ${className}` : ''}`}>
        {showCompare ? (
          <span className="cm-price-compare" aria-hidden>
            {formatGel(compareAtAmount!)}
          </span>
        ) : null}
        <span className="cm-price-amount">{formatGel(amount)}</span>
        {suffix ? <span className="cm-price-suffix">{suffix}</span> : null}
      </span>
    );
  }

  return (
    <div
      className={`cm-kit-card-price-row${className ? ` ${className}` : ''}`}
    >
      {showCompare ? (
        <span className="cm-kit-card-compare">
          {compareLabel ? (
            <span className="sr-only">{compareLabel}</span>
          ) : null}
          {formatGel(compareAtAmount!)}
        </span>
      ) : null}
      <p className="cm-kit-card-price">
        {formatGel(amount)}
        {suffix}
      </p>
    </div>
  );
}

/** Total line with optional strikethrough compare-at (package catalog footers). */
export function TotalWithCompare({
  label,
  amount,
  compareAtAmount,
  meta,
}: {
  label: string;
  amount: number;
  compareAtAmount?: number | null;
  meta?: string;
}) {
  const showCompare = shouldShowCompareAt(amount, compareAtAmount);

  return (
    <p className="cm-kit-card-total-line">
      <span>
        {label}: <strong>{formatGel(amount)}</strong>
      </span>
      {showCompare ? (
        <span className="cm-kit-card-compare-inline">
          {formatGel(compareAtAmount!)}
        </span>
      ) : null}
      {meta ? <span className="cm-kit-card-total-meta">{meta}</span> : null}
    </p>
  );
}
