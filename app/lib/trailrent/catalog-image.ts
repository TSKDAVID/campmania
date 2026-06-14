/** Consistent cropped thumbnails for package & gear catalog cards (4:5). */
export function catalogCardImageUrl(
  url?: string | null,
  width = 800,
): string | undefined {
  if (!url) return undefined;
  const height = Math.round(width * 1.25);
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('width', String(width));
    parsed.searchParams.set('height', String(height));
    parsed.searchParams.set('crop', 'center');
    return parsed.toString();
  } catch {
    return url;
  }
}

export function catalogCardImageSrcSet(url?: string | null): string | undefined {
  if (!url) return undefined;
  const widths = [320, 480, 640, 800];
  return widths
    .map((w) => {
      const src = catalogCardImageUrl(url, w);
      return src ? `${src} ${w}w` : null;
    })
    .filter(Boolean)
    .join(', ');
}

/** Sizes for 2-col mobile grids scaling up to 4-col desktop. */
export const CATALOG_CARD_IMAGE_SIZES =
  '(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 44vw, 48vw';
