import {
  CATALOG_CARD_IMAGE_SIZES,
  catalogCardImageSrcSet,
  catalogCardImageUrl,
} from '~/lib/trailrent/catalog-image';

export function CatalogCardImage({
  src,
  alt,
  loading = 'lazy',
}: {
  src: string;
  alt: string;
  loading?: 'eager' | 'lazy';
}) {
  const optimizedSrc = catalogCardImageUrl(src, 640) ?? src;
  const srcSet = catalogCardImageSrcSet(src);

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={CATALOG_CARD_IMAGE_SIZES}
      alt={alt}
      className="cm-kit-card-image"
      loading={loading}
      decoding="async"
    />
  );
}
