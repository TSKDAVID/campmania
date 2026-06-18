import type {GearBuilderMetafields, GearItemType, PackageDuration} from './types';

const VALID_ITEM_TYPES = new Set<GearItemType>([
  'backpack',
  'tent',
  'sleeping_bag',
  'shoes',
  'kitchen',
  'lighting',
  'navigation',
  'other',
]);

const VALID_DURATIONS = new Set<PackageDuration>(['1-day', '2-day', 'weekend']);

export function parseItemType(value?: string | null): GearItemType {
  const raw = (value ?? '').trim();
  const normalized = raw.toLowerCase().replace(/\s+/g, '_');

  const aliases: Record<string, GearItemType> = {
    ensemble: 'tent',
    კარავი: 'tent',
    ანსამბლი: 'tent',
    sleeping: 'sleeping_bag',
    electronics: 'lighting',
  };

  if (aliases[normalized] || aliases[raw]) {
    return aliases[normalized] ?? aliases[raw]!;
  }

  if (VALID_ITEM_TYPES.has(normalized as GearItemType)) {
    return normalized as GearItemType;
  }
  return 'other';
}

export function parseBooleanMetafield(value?: string | null): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

export function parseDurationFit(value?: string | null): PackageDuration[] {
  if (!value?.trim()) return ['1-day', '2-day', 'weekend'];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim() as PackageDuration)
        .filter((entry) => VALID_DURATIONS.has(entry));
    }
  } catch {
    // comma or newline separated
  }
  return value
    .split(/[,\n]/)
    .map((entry) => entry.trim() as PackageDuration)
    .filter((entry) => VALID_DURATIONS.has(entry));
}

export function parseGearBuilderMetafields(input: {
  itemType?: string | null;
  builderEnabled?: string | null;
  capacityLiters?: string | null;
  capacityClass?: string | null;
  durationFit?: string | null;
  thumbnailPriority?: string | null;
}): GearBuilderMetafields {
  const capacity = Number(input.capacityLiters ?? '');
  const priority = Number(input.thumbnailPriority ?? '');
  return {
    itemType: parseItemType(input.itemType),
    builderEnabled: parseBooleanMetafield(input.builderEnabled),
    capacityLiters: Number.isFinite(capacity) && capacity > 0 ? capacity : undefined,
    capacityClass: input.capacityClass?.trim() || undefined,
    durationFit: parseDurationFit(input.durationFit),
    thumbnailPriority: Number.isFinite(priority) ? priority : 0,
  };
}

export function capacityFromVariantTitle(title: string): number | undefined {
  const match = title.match(/(\d{2,3})\s*l/i);
  if (!match) return undefined;
  const liters = Number(match[1]);
  return Number.isFinite(liters) ? liters : undefined;
}
