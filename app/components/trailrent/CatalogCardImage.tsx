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
}: {
  src: string;
  alt: string;
  loading?: 'eager' | 'lazy';
  /** contain = full product visible; cover = fill frame (kits) */
  fit?: 'cover' | 'contain';
}) {
  const crop = fit === 'cover';
  const optimizedSrc = catalogCardImageUrl(src, 640, {crop}) ?? src;
  const srcSet = catalogCardImageSrcSet(src, {crop});

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
