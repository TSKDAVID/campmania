import {
  CATALOG_CARD_IMAGE_SIZES,
  catalogCardImageSrcSet,
  catalogCardImageUrl,
} from '~/lib/trailrent/catalog-image';

export function CatalogCardImage({
  src,
  alt,
  loading = 'lazy',
  fit = 'cover',
  cropHeightRatio,
}: {
  src: string;
  alt: string;
  loading?: 'eager' | 'lazy';
  /** contain = full product visible; cover = fill frame (kits) */
  fit?: 'cover' | 'contain';
  /** Height as a fraction of width when cropping (e.g. 0.75 = 4:3 landscape). */
  cropHeightRatio?: number;
}) {
  const crop = fit === 'cover';
  const cropOptions = crop
    ? {crop: true as const, cropHeightRatio}
    : {crop: false as const};
  const optimizedSrc = catalogCardImageUrl(src, 640, cropOptions) ?? src;
  const srcSet = catalogCardImageSrcSet(src, cropOptions);

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={CATALOG_CARD_IMAGE_SIZES}
      alt={alt}
      className={`cm-kit-card-image${fit === 'contain' ? ' cm-kit-card-image--contain' : ''}`}
      loading={loading}
      decoding="async"
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
    />
  );
}
