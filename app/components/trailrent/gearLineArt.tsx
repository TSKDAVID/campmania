/** Minimal monoline SVG gear illustrations for hero art direction. */
const STROKE = '#2A2A2A';

export const GEAR_LINE_ART = {
  tent: (
    <svg viewBox="0 0 120 100" fill="none" aria-hidden>
      <path
        d="M10 78 L60 18 L110 78 Z"
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M60 18 L60 78" stroke={STROKE} strokeWidth="1.5" />
      <path d="M28 78 L92 78" stroke={STROKE} strokeWidth="1.5" />
      <path d="M38 58 L82 58" stroke={STROKE} strokeWidth="1.2" strokeDasharray="3 4" />
    </svg>
  ),
  sleepingBag: (
    <svg viewBox="0 0 120 100" fill="none" aria-hidden>
      <rect
        x="18"
        y="32"
        width="84"
        height="36"
        rx="18"
        stroke={STROKE}
        strokeWidth="1.5"
      />
      <path
        d="M36 32 C36 22 48 16 60 16 C72 16 84 22 84 32"
        stroke={STROKE}
        strokeWidth="1.5"
      />
      <path d="M42 50 L78 50" stroke={STROKE} strokeWidth="1.2" />
    </svg>
  ),
  cookSet: (
    <svg viewBox="0 0 120 100" fill="none" aria-hidden>
      <ellipse cx="60" cy="68" rx="34" ry="10" stroke={STROKE} strokeWidth="1.5" />
      <path
        d="M26 68 C26 48 42 34 60 34 C78 34 94 48 94 68"
        stroke={STROKE}
        strokeWidth="1.5"
      />
      <path d="M44 28 L76 28" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M48 22 L72 22" stroke={STROKE} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  snowboard: (
    <svg viewBox="0 0 120 100" fill="none" aria-hidden>
      <path
        d="M22 72 C34 28 86 28 98 72"
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M38 58 L82 58" stroke={STROKE} strokeWidth="1.2" />
      <circle cx="60" cy="58" r="3" stroke={STROKE} strokeWidth="1.2" />
    </svg>
  ),
} as const;

export type GearArtKey = keyof typeof GEAR_LINE_ART;

export const DEFAULT_GEAR_KEYS: GearArtKey[] = [
  'tent',
  'sleepingBag',
  'cookSet',
  'snowboard',
];

export function gearArtToDataUrl(key: GearArtKey): string {
  const svgs: Record<GearArtKey, string> = {
    tent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" fill="none"><path d="M10 78 L60 18 L110 78 Z" stroke="${STROKE}" stroke-width="1.5" stroke-linejoin="round"/><path d="M60 18 L60 78" stroke="${STROKE}" stroke-width="1.5"/><path d="M28 78 L92 78" stroke="${STROKE}" stroke-width="1.5"/></svg>`,
    sleepingBag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" fill="none"><rect x="18" y="32" width="84" height="36" rx="18" stroke="${STROKE}" stroke-width="1.5"/><path d="M36 32 C36 22 48 16 60 16 C72 16 84 22 84 32" stroke="${STROKE}" stroke-width="1.5"/></svg>`,
    cookSet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" fill="none"><ellipse cx="60" cy="68" rx="34" ry="10" stroke="${STROKE}" stroke-width="1.5"/><path d="M26 68 C26 48 42 34 60 34 C78 34 94 48 94 68" stroke="${STROKE}" stroke-width="1.5"/></svg>`,
    snowboard: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" fill="none"><path d="M22 72 C34 28 86 28 98 72" stroke="${STROKE}" stroke-width="1.5" stroke-linecap="round"/><path d="M38 58 L82 58" stroke="${STROKE}" stroke-width="1.2"/></svg>`,
  };
  return `data:image/svg+xml,${encodeURIComponent(svgs[key])}`;
}
