export type GearItemType =
  | 'backpack'
  | 'tent'
  | 'sleeping_bag'
  | 'shoes'
  | 'kitchen'
  | 'lighting'
  | 'navigation'
  | 'other';

export type PackageDuration = '1-day' | '2-day' | 'weekend';

export type GearBuilderMetafields = {
  itemType: GearItemType;
  builderEnabled: boolean;
  capacityLiters?: number;
  capacityClass?: string;
  durationFit: PackageDuration[];
  thumbnailPriority: number;
};

export type GearBuilderProduct = {
  id: string;
  handle: string;
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  dailyRate: number;
  variantId?: string;
  availableForSale: boolean;
  metafields: GearBuilderMetafields;
  variants: Array<{
    id: string;
    title: string;
    availableForSale: boolean;
    price: number;
    capacityLiters?: number;
  }>;
};

export type GearBuilderSlot = {
  itemType: GearItemType;
  productId?: string;
  variantId?: string;
  handle?: string;
  title?: string;
  imageUrl?: string;
  dailyRate?: number;
};

export type GearBuilderState = {
  version: 1;
  slots: GearBuilderSlot[];
  updatedAt: string;
  buildId?: string;
  name?: string;
  trek?: string;
};

export type SavedGearBuild = {
  id: string;
  name: string;
  trek?: string;
  slots: GearBuilderSlot[];
  updatedAt: string;
};

export type GearBuilderLibrary = {
  version: 2;
  builds: SavedGearBuild[];
};

/** Max item slots in one working build. */
export const GEAR_BUILDER_MAX_SLOTS = 6;

/** Max named builds stored per account/session. */
export const GEAR_BUILDER_MAX_SAVED_BUILDS = 5;

export type ResolvedPackageItem = {
  productId: string;
  handle: string;
  title: string;
  imageUrl?: string;
  variantId?: string;
  dailyRate: number;
  itemType: GearItemType;
};

export type ResolvedPackage = {
  trek: string;
  duration: PackageDuration;
  days: number;
  items: ResolvedPackageItem[];
  subtotalDaily: number;
  bundleDaily: number;
  bundleTotal: number;
  discountPercent: number;
};

export const GEAR_ITEM_TYPES: GearItemType[] = [
  'backpack',
  'tent',
  'sleeping_bag',
  'shoes',
  'kitchen',
  'lighting',
  'navigation',
];

export const PACKAGE_BUNDLE_DISCOUNT = 0.2;

/** Minimum filled gear slots required to save a build or apply bundle pricing. */
export const GEAR_BUILDER_MIN_SAVE_ITEMS = 2;
