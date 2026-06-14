import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

export function ProductImage({
  image,
  title,
}: {
  image: ProductVariantFragment['image'];
  title?: string;
}) {
  if (!image) {
    return (
      <div className="cm-product-gallery">
        <div className="cm-product-gallery-placeholder" aria-hidden>
          <span className="text-sm font-semibold uppercase tracking-widest text-muted">
            No image
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="cm-product-gallery">
      <div className="cm-product-gallery-frame">
        <Image
          alt={image.altText || title || 'Product Image'}
          aspectRatio="4/5"
          data={image}
          key={image.id}
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="cm-product-gallery-image"
        />
      </div>
    </div>
  );
}
