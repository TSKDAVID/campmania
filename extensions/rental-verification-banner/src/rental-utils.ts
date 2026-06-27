import type {CartLine} from '@shopify/ui-extensions/checkout';

export function lineIsRental(line: CartLine): boolean {
  const attrs = line.attributes ?? [];
  return attrs.some(
    (attr) => attr.key === 'fulfillment_mode' && attr.value === 'rent',
  );
}

export function cartHasRentalLines(lines: CartLine[]): boolean {
  return lines.some(lineIsRental);
}
