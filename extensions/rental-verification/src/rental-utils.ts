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

export function sumDepositAmount(lines: CartLine[]): number {
  return lines.reduce((total, line) => {
    if (!lineIsRental(line)) return total;
    const depositAttr = line.attributes?.find(
      (attr) => attr.key === 'deposit_amount',
    );
    const perUnit = Number(depositAttr?.value ?? 0);
    const qty = line.quantity ?? 1;
    if (!Number.isFinite(perUnit) || perUnit <= 0) return total;
    return total + perUnit * qty;
  }, 0);
}

export type ExtensionSettings = {
  storefront_api_origin?: string;
  checkout_extension_secret?: string;
};

export function getApiOrigin(settings: ExtensionSettings): string | null {
  const origin = settings.storefront_api_origin?.trim();
  return origin ? origin.replace(/\/$/, '') : null;
}

export async function fetchKycStatus(
  origin: string,
  secret: string,
  customerId: string,
): Promise<{verified: boolean; blocked: boolean; status: string}> {
  const url = `${origin}/api/kyc/status?customerId=${encodeURIComponent(customerId)}`;
  const response = await fetch(url, {
    headers: {'X-Campmania-Checkout-Secret': secret},
  });
  if (!response.ok) {
    return {verified: false, blocked: false, status: 'error'};
  }
  return (await response.json()) as {
    verified: boolean;
    blocked: boolean;
    status: string;
  };
}

export async function createKycSession(
  origin: string,
  secret: string,
  customerId: string,
  email?: string | null,
): Promise<{url?: string; session_id?: string; error?: string}> {
  const response = await fetch(`${origin}/api/kyc/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Campmania-Checkout-Secret': secret,
    },
    body: JSON.stringify({customerId, email}),
  });
  return (await response.json()) as {
    url?: string;
    session_id?: string;
    error?: string;
  };
}
