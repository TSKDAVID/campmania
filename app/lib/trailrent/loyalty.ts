export type LoyaltyTier = 'explorer' | 'trail-tested';

export type LoyaltyStatus = {
  tier: LoyaltyTier;
  cleanReturns: number;
  returnsToNextTier: number;
  progressPercent: number;
  isVerified: boolean;
  benefits: string[];
};

const TRAIL_TESTED_TAG = 'tier:trail-tested';
const RETURNS_FOR_TIER = 2;

/** True when customer carries the Trail Tested VIP tag. */
export function isTrustedTier(tags: string[]): boolean {
  return tags.includes(TRAIL_TESTED_TAG);
}

/** Mock loyalty — production: read customer tags from Shopify Customer Account API */
export function getLoyaltyStatus(options: {
  tags?: string[];
  email?: string | null;
  demoTier?: LoyaltyTier | null;
  /** When true, only use Shopify customer tags (logged-in production users). */
  tagsOnly?: boolean;
}): LoyaltyStatus {
  const {tags = [], email, demoTier, tagsOnly = false} = options;

  const hasTrailTestedTag =
    tags.includes(TRAIL_TESTED_TAG) ||
    (!tagsOnly &&
      (demoTier === 'trail-tested' ||
        email === 'trail-tested@demo.campmania.ge'));

  if (hasTrailTestedTag) {
    return {
      tier: 'trail-tested',
      cleanReturns: RETURNS_FOR_TIER,
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
        : 1;

  const progressPercent = Math.round(
    (cleanReturns / RETURNS_FOR_TIER) * 100,
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

export function parseCustomerTags(tags?: string | string[] | null): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(',').map((t) => t.trim()).filter(Boolean);
}
