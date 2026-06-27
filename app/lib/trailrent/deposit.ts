import type {CartLine} from '~/components/CartLineItem';
import {getLineAttributeMap, getLineFulfillmentMode} from '~/lib/trailrent/cart-display';

export const DEPOSIT_AMOUNT_ATTR = 'deposit_amount';

export function parseDepositAmount(value?: string | null): number {
  if (!value) return 0;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function cartHasRentalLines(lines: CartLine[]): boolean {
  return lines.some((line) => getLineFulfillmentMode(line) === 'rent');
}

export function sumLineDeposits(lines: CartLine[]): number {
  return lines.reduce((total, line) => {
    if (getLineFulfillmentMode(line) !== 'rent') return total;
    const attrs = getLineAttributeMap(line);
    const perUnit = parseDepositAmount(attrs[DEPOSIT_AMOUNT_ATTR]);
    const qty = line.quantity ?? 1;
    return total + perUnit * qty;
  }, 0);
}

export function formatDepositGel(amount: number): string {
  if (amount <= 0) return '0 ₾';
  return `${amount.toLocaleString('en-US', {maximumFractionDigits: 0})} ₾`;
}
