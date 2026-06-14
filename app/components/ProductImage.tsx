import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

export function ProductImage({
  image,
  title,
  variant = 'kit',
}: {
  image: ProductVariantFragment['image'];
  title?: string;
  /** Solo gear uses square contain; kits use portrait cover. */
  variant?: 'solo' | 'kit';
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
          aspectRatio={variant === 'solo' ? '1' : '3/4'}
          data={image}
          key={image.id}
          sizes={
            variant === 'solo'
              ? '(min-width: 1280px) 28vw, (min-width: 1024px) 32vw, 100vw'
              : '(min-width: 1280px) 32vw, (min-width: 1024px) 38vw, 100vw'
          }
          className="cm-product-gallery-image"
        />
      </div>
    </div>
  );
}
