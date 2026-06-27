import {parseCustomerTags} from '~/lib/trailrent/loyalty';

export const KYC_VERIFIED_TAG = 'kyc:verified';
export const KYC_DECLINED_TAG = 'kyc:declined';
export const KYC_IN_REVIEW_TAG = 'kyc:in_review';
export const RENTAL_BLOCKED_TAG = 'rental:blocked';

const KYC_STATUS_TAGS = [
  KYC_VERIFIED_TAG,
  KYC_DECLINED_TAG,
  KYC_IN_REVIEW_TAG,
] as const;

export type KycCheckoutStatus =
  | 'verified'
  | 'declined'
  | 'in_review'
  | 'not_started'
  | 'blocked';

export function isKycVerified(tags: string[] | string | null | undefined): boolean {
  return parseCustomerTags(tags).includes(KYC_VERIFIED_TAG);
}

export function isRentalBlocked(tags: string[] | string | null | undefined): boolean {
  const parsed = parseCustomerTags(tags);
  return parsed.includes(RENTAL_BLOCKED_TAG) || parsed.includes(KYC_DECLINED_TAG);
}

export function getKycCheckoutStatus(
  tags: string[] | string | null | undefined,
): KycCheckoutStatus {
  const parsed = parseCustomerTags(tags);
  if (parsed.includes(RENTAL_BLOCKED_TAG)) return 'blocked';
  if (parsed.includes(KYC_DECLINED_TAG)) return 'declined';
  if (parsed.includes(KYC_IN_REVIEW_TAG)) return 'in_review';
  if (parsed.includes(KYC_VERIFIED_TAG)) return 'verified';
  return 'not_started';
}

export function kycTagsForDiditStatus(status: string): {
  add: string[];
  remove: string[];
} {
  const allKyc = [...KYC_STATUS_TAGS];
  switch (status) {
    case 'Approved':
      return {
        add: [KYC_VERIFIED_TAG],
        remove: allKyc.filter((tag) => tag !== KYC_VERIFIED_TAG),
      };
    case 'Declined':
      return {
        add: [KYC_DECLINED_TAG],
        remove: allKyc.filter((tag) => tag !== KYC_DECLINED_TAG),
      };
    case 'In Review':
      return {
        add: [KYC_IN_REVIEW_TAG],
        remove: allKyc.filter((tag) => tag !== KYC_IN_REVIEW_TAG),
      };
    case 'Kyc Expired':
      return {add: [], remove: [KYC_VERIFIED_TAG]};
    default:
      return {add: [], remove: []};
  }
}
