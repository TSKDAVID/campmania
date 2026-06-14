/** Consistent cropped thumbnails for package & gear catalog cards (4:5). */
export function catalogCardImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('width', '800');
    parsed.searchParams.set('height', '1000');
    parsed.searchParams.set('crop', 'center');
    return parsed.toString();
  } catch {
    return url;
  }
}
