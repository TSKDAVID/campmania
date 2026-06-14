/** Width-only Shopify CDN resize — no crop (for object-contain cards). */
export function catalogCardImageUrl(
  url?: string | null,
  width = 800,
  options?: {crop?: boolean},
): string | undefined {
  if (!url) return undefined;
  const crop = options?.crop !== false;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('width', String(width));
    if (crop) {
      const height = Math.round(width * 1.25);
      parsed.searchParams.set('height', String(height));
      parsed.searchParams.set('crop', 'center');
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function catalogCardImageSrcSet(
  url?: string | null,
  options?: {crop?: boolean},
): string | undefined {
  if (!url) return undefined;
  const widths = [320, 480, 640, 800];
  return widths
    .map((w) => {
      const src = catalogCardImageUrl(url, w, options);
      return src ? `${src} ${w}w` : null;
    })
    .filter(Boolean)
    .join(', ');
}

/** Sizes for 2-col mobile grids scaling up to 4-col desktop. */
export const CATALOG_CARD_IMAGE_SIZES =
  '(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 44vw, 48vw';
