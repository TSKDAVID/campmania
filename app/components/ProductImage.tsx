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
      <div className={`cm-product-gallery cm-product-gallery--${variant}`}>
        <div className="cm-product-gallery-placeholder" aria-hidden>
          <span className="text-sm font-semibold uppercase tracking-widest text-muted">
            No image
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`cm-product-gallery cm-product-gallery--${variant}`}>
      <div className="cm-product-gallery-frame">
        <Image
          alt={image.altText || title || 'Product Image'}
          data={image}
          key={image.id}
          sizes={
            variant === 'solo'
              ? '(min-width: 1280px) 42vw, (min-width: 1024px) 44vw, 100vw'
              : '(min-width: 1280px) 44vw, (min-width: 1024px) 46vw, 100vw'
          }
          className="cm-product-gallery-image"
        />
      </div>
    </div>
  );
}
