import {catalogCardImageUrl} from '~/lib/trailrent/catalog-image';

export function CatalogCardImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const optimizedSrc = catalogCardImageUrl(src) ?? src;

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className="cm-kit-card-image"
      loading="lazy"
      decoding="async"
    />
  );
}
