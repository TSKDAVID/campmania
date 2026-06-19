import type {CartLine} from '~/components/CartLineItem';
import {METRO_STATIONS, getStationLabel} from '~/lib/trailrent/metro';
import {formatGel, formatRentalDate} from '~/lib/trailrent/pricing';

type SelectedOption = {name: string; value: string};

export function moneyAmount(
  money?: {amount?: string | null} | null,
): number {
  if (!money?.amount) return 0;
  const amount = Number(money.amount);
  return Number.isFinite(amount) ? amount : 0;
}

export function formatCartMoney(
  money?: {amount?: string | null} | null,
): string {
  return formatGel(moneyAmount(money));
}

export function isDefaultVariantOption(option: SelectedOption): boolean {
  return (
    option.name === 'Title' &&
    (option.value === 'Default Title' || option.value === 'Default')
  );
}

export function getVisibleSelectedOptions(
  options: SelectedOption[] | undefined,
): SelectedOption[] {
  return (options ?? []).filter((option) => !isDefaultVariantOption(option));
}

export function getLineAttributeMap(
  line: CartLine,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const attribute of line.attributes ?? []) {
    if (attribute?.key) map[attribute.key] = attribute.value ?? '';
  }
  return map;
}

export function getLineFulfillmentMode(
  line: CartLine,
): 'rent' | 'purchase' | undefined {
  const mode = getLineAttributeMap(line).fulfillment_mode;
  if (mode === 'rent' || mode === 'purchase') return mode;
  return undefined;
}

type CartLineWithComponents = CartLine & {
  lineComponents?: CartLine[];
};

export function hasLineComponents(
  line: CartLine,
): line is CartLineWithComponents {
  return (
    'lineComponents' in line &&
    Array.isArray((line as CartLineWithComponents).lineComponents)
  );
}

export function isBundleCartLine(line: CartLine): boolean {
  return hasLineComponents(line) && (line.lineComponents?.length ?? 0) > 0;
}

export function resolveCartLineDisplayPrice(line: CartLine): number {
  const attrs = getLineAttributeMap(line);
  const mode = getLineFulfillmentMode(line);

  if (mode === 'rent') {
    const quotedDaily = Number(attrs.quoted_daily_rate ?? 0);
    const days = getCartLineRentalDays(line) ?? 0;
    if (quotedDaily > 0 && days > 0) {
      return quotedDaily * days;
    }
  }

  const totalFromCost = moneyAmount(line.cost?.totalAmount);
  if (totalFromCost > 0) return totalFromCost;

  const perQty = moneyAmount(line.cost?.amountPerQuantity);
  const variantPrice = moneyAmount(line.merchandise?.price);
  const unitPrice = perQty > 0 ? perQty : variantPrice;
  const qty = line.quantity ?? 0;

  if (unitPrice > 0 && qty > 0) return unitPrice * qty;

  const quoted = Number(attrs.quoted_purchase_price ?? 0);
  if (quoted > 0) return quoted;

  if (hasLineComponents(line) && line.lineComponents?.length) {
    return line.lineComponents.reduce(
      (sum, component) => sum + resolveCartLineDisplayPrice(component),
      0,
    );
  }

  return 0;
}

export function resolveCartLineUnitPrice(line: CartLine): number {
  const attrs = getLineAttributeMap(line);
  if (getLineFulfillmentMode(line) === 'rent') {
    const quotedDaily = Number(attrs.quoted_daily_rate ?? 0);
    if (quotedDaily > 0) return quotedDaily;
  }

  const perQty = moneyAmount(line.cost?.amountPerQuantity);
  if (perQty > 0) return perQty;

  const variantPrice = moneyAmount(line.merchandise?.price);
  if (variantPrice > 0) return variantPrice;

  const qty = line.quantity ?? 0;
  const total = resolveCartLineDisplayPrice(line);
  if (total > 0 && qty > 0) return total / qty;

  return 0;
}

export function resolveCartLineCompareAtDaily(line: CartLine): number | undefined {
  const attrs = getLineAttributeMap(line);
  if (getLineFulfillmentMode(line) !== 'rent') return undefined;

  const compare = Number(attrs.quoted_compare_at_daily ?? 0);
  const daily = Number(attrs.quoted_daily_rate ?? 0);
  if (compare > 0 && compare > daily) return compare;

  return undefined;
}

export function resolveCartLineCompareAtTotal(line: CartLine): number | undefined {
  const compareDaily = resolveCartLineCompareAtDaily(line);
  if (!compareDaily) return undefined;

  const days = getCartLineRentalDays(line) ?? 0;
  if (days <= 0) return undefined;

  return compareDaily * days;
}

export function resolveCartDisplaySubtotal(lines: CartLine[]): number {
  return lines
    .filter(shouldShowCartLine)
    .reduce((sum, line) => sum + resolveCartLineDisplayPrice(line), 0);
}

export function shouldShowCartLine(line: CartLine): boolean {
  if ('parentRelationship' in line && line.parentRelationship?.parent) {
    return false;
  }

  const qty = line.quantity ?? 0;

  if (qty <= 0) {
    if (hasLineComponents(line) && line.lineComponents?.length) {
      return line.lineComponents.some(shouldShowCartLine);
    }
    return false;
  }

  return true;
}

export function canEditCartLineQuantity(line: CartLine): boolean {
  if (isBundleCartLine(line)) return false;

  const attrs = getLineAttributeMap(line);
  if (attrs.gear_builder === 'true') return false;
  if (getLineFulfillmentMode(line) === 'rent') return false;

  return true;
}

export function getCartLineRentalDays(line: CartLine): number | undefined {
  const attrs = getLineAttributeMap(line);
  const fromAttr = Number(attrs.rental_days ?? 0);
  if (fromAttr > 0) return fromAttr;

  if (getLineFulfillmentMode(line) === 'rent' && (line.quantity ?? 0) > 0) {
    return line.quantity ?? undefined;
  }

  return undefined;
}

export function getCartLineMetroLabel(
  line: CartLine,
  locale: 'ka' | 'en',
): string | undefined {
  const metroId = getLineAttributeMap(line).metro_station;
  if (!metroId) return undefined;

  const station = METRO_STATIONS.find((entry) => entry.id === metroId);
  return station ? getStationLabel(station, locale) : metroId;
}

export function getCartLineRentalPeriodLabel(
  line: CartLine,
  locale: 'ka' | 'en',
): string | undefined {
  const attrs = getLineAttributeMap(line);
  const start = attrs.rental_start;
  const end = attrs.rental_end;
  if (!start || !end) return undefined;

  return `${formatRentalDate(start, locale)} → ${formatRentalDate(end, locale)}`;
}

export type CartLineMeta = {
  modeLabel?: string;
  rentalDays?: number;
  rentalPeriod?: string;
  metro?: string;
  isBundle: boolean;
};

export function getCartLineMeta(
  line: CartLine,
  locale: 'ka' | 'en',
  labels: {
    modeRent: string;
    modeBuy: string;
  },
): CartLineMeta {
  const mode = getLineFulfillmentMode(line);
  const rentalDays = getCartLineRentalDays(line);

  return {
    modeLabel:
      mode === 'rent'
        ? labels.modeRent
        : mode === 'purchase'
          ? labels.modeBuy
          : undefined,
    rentalDays,
    rentalPeriod: getCartLineRentalPeriodLabel(line, locale),
    metro: getCartLineMetroLabel(line, locale),
    isBundle: isBundleCartLine(line),
  };
}
