import type {CustomerRentalHistoryQuery} from 'customer-accountapi.generated';
import {isRentalLineItem} from '~/lib/trailrent/rent-to-own';

export type LoyaltyTier = 'explorer' | 'trail-tested';

export type LoyaltyStatus = {
  tier: LoyaltyTier;
  cleanReturns: number;
  returnsToNextTier: number;
  progressPercent: number;
  isVerified: boolean;
  benefits: string[];
};

type RentalHistoryOrder =
  CustomerRentalHistoryQuery['customer']['orders']['nodes'][number];

const TRAIL_TESTED_TAG = 'tier:trail-tested';
export const RETURNS_FOR_TIER = 2;

const COMPLETED_FULFILLMENT = new Set(['FULFILLED', 'PARTIALLY_FULFILLED']);

function orderHasRentalLine(order: RentalHistoryOrder): boolean {
  return order.lineItems.nodes.some(isRentalLineItem);
}

/** Count fulfilled rental orders — each completed trip counts toward Trail Tested. */
export function countCompletedRentalReturns(
  orders: RentalHistoryOrder[],
): number {
  return orders.filter((order) => {
    if (!orderHasRentalLine(order)) return false;
    return COMPLETED_FULFILLMENT.has(order.fulfillmentStatus);
  }).length;
}

/** True when customer earned Trail Tested via tag or completed rentals. */
export function isTrustedTier(
  tags: string[],
  orders: RentalHistoryOrder[] = [],
): boolean {
  if (tags.includes(TRAIL_TESTED_TAG)) return true;
  return countCompletedRentalReturns(orders) >= RETURNS_FOR_TIER;
}

export function getLoyaltyStatus(options: {
  tags?: string[];
  orders?: RentalHistoryOrder[];
  email?: string | null;
  demoTier?: LoyaltyTier | null;
  /** When true, only use Shopify tags + order history (logged-in production users). */
  tagsOnly?: boolean;
}): LoyaltyStatus {
  const {tags = [], orders = [], email, demoTier, tagsOnly = false} = options;

  const completedReturns = countCompletedRentalReturns(orders);

  const hasTrailTestedTag =
    tags.includes(TRAIL_TESTED_TAG) ||
    (!tagsOnly &&
      (demoTier === 'trail-tested' ||
        email === 'trail-tested@demo.campmania.ge'));

  const earnedByRentals = completedReturns >= RETURNS_FOR_TIER;

  if (hasTrailTestedTag || earnedByRentals) {
    return {
      tier: 'trail-tested',
      cleanReturns: Math.max(completedReturns, RETURNS_FOR_TIER),
      returnsToNextTier: 0,
      progressPercent: 100,
      isVerified: true,
      benefits: [
        '0 ₾ deposit always',
        'Priority booking slots',
        'Free gear upgrades when available',
      ],
    };
  }

  const cleanReturns =
    !tagsOnly && demoTier === 'explorer'
      ? 1
      : !tagsOnly && email === 'explorer@demo.campmania.ge'
        ? 1
        : completedReturns;

  const progressPercent = Math.min(
    100,
    Math.round((cleanReturns / RETURNS_FOR_TIER) * 100),
  );

  return {
    tier: 'explorer',
    cleanReturns,
    returnsToNextTier: Math.max(0, RETURNS_FOR_TIER - cleanReturns),
    progressPercent,
    isVerified: false,
    benefits: [
      'Digital ID verification',
      'Metro hub pickup',
      '1 more clean return → Trail Tested',
    ],
  };
}

export function loyaltyProgressLabel(
  returnsToNextTier: number,
  locale: 'ka' | 'en',
): string {
  if (returnsToNextTier <= 0) {
    return locale === 'ka' ? 'Trail Tested მიღწეულია' : 'Trail Tested unlocked';
  }
  if (locale === 'ka') {
    return `კიდევ ${returnsToNextTier} სუფთა დაბრუნება Trail Tested-მდე`;
  }
  const noun = returnsToNextTier === 1 ? 'return' : 'returns';
  return `${returnsToNextTier} more clean ${noun} to Trail Tested`;
}

export function parseCustomerTags(tags?: string | string[] | null): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(',').map((t) => t.trim()).filter(Boolean);
}
