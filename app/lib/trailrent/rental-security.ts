import type {CartApiQueryFragment} from 'storefrontapi.generated';

export const RENTAL_SECURITY_PATH_ATTR = 'rental_security_path';
export const DEPOSIT_TOTAL_ATTR = 'deposit_total';
export const KYC_SESSION_ID_ATTR = 'kyc_session_id';

export type RentalSecurityPath = 'kyc' | 'deposit' | '';

export function getCartAttributeMap(
  attributes?: CartApiQueryFragment['attributes'] | null,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const attr of attributes ?? []) {
    if (attr?.key && attr.value != null) {
      map[attr.key] = attr.value;
    }
  }
  return map;
}

export function mergeCartAttributes(
  existing: CartApiQueryFragment['attributes'] | null | undefined,
  updates: Record<string, string>,
): Array<{key: string; value: string}> {
  const map = getCartAttributeMap(existing);
  for (const [key, value] of Object.entries(updates)) {
    map[key] = value;
  }
  return Object.entries(map).map(([key, value]) => ({key, value}));
}

export function readSecurityPath(
  attributes?: CartApiQueryFragment['attributes'] | null,
): RentalSecurityPath {
  const value = getCartAttributeMap(attributes)[RENTAL_SECURITY_PATH_ATTR];
  if (value === 'kyc' || value === 'deposit') return value;
  return '';
}
