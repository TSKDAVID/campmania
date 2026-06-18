import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import {IconArrowRight} from '~/components/trailrent/Icons';

export type GalleryImage = {
  id: string;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type VariantImage = NonNullable<ProductVariantFragment['image']>;

function variantToGalleryImage(image: VariantImage): GalleryImage {
  return {
    id: image.id ?? image.url,
    url: image.url,
    altText: image.altText,
    width: image.width,
    height: image.height,
  };
}

function dedupeGalleryImages(images: GalleryImage[]): GalleryImage[] {
  const seen = new Set<string>();
  return images.filter((image) => {
    const key = image.id || image.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function ProductImage({
  images,
  image,
  title,
  variant = 'kit',
}: {
  /** Product media / images from the loader. */
  images?: GalleryImage[];
  /** Fallback single variant image. */
  image?: ProductVariantFragment['image'];
  title?: string;
  /** Solo gear uses square contain; kits use portrait cover. */
  variant?: 'solo' | 'kit';
}) {
  const slides = useMemo(() => {
    const fromProp = images?.length ? images : [];
    if (fromProp.length) return dedupeGalleryImages(fromProp);
    if (image) return [variantToGalleryImage(image)];
    return [];
  }, [images, image]);

  const slideKey = slides.map((slide) => slide.id).join('|');
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [slideKey]);

  const hasMultiple = slides.length > 1;

  const goTo = useCallback(
    (index: number) => {
      if (!slides.length) return;
      const next = ((index % slides.length) + slides.length) % slides.length;
      setActiveIndex(next);
    },
    [slides.length],
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current == null || !hasMultiple) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX == null) return;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) goPrev();
    else goNext();
  };

  const sizes =
    variant === 'solo'
      ? '(min-width: 1280px) 42vw, (min-width: 1024px) 44vw, 100vw'
      : '(min-width: 1280px) 44vw, (min-width: 1024px) 46vw, 100vw';

  if (!slides.length) {
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

  const activeSlide = slides[activeIndex] ?? slides[0];

  return (
    <div
      className={`cm-product-gallery cm-product-gallery--${variant}${
        hasMultiple ? ' cm-product-gallery--multi' : ''
      }`}
    >
      <div
        className="cm-product-gallery-frame"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="cm-product-gallery-stage" aria-live="polite">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={slide.id}
                className={`cm-product-gallery-slide${
                  isActive ? ' cm-product-gallery-slide--active' : ''
                }`}
                aria-hidden={!isActive}
              >
                <Image
                  alt={slide.altText || title || 'Product image'}
                  data={{
                    url: slide.url,
                    altText: slide.altText,
                    width: slide.width,
                    height: slide.height,
                  }}
                  sizes={sizes}
                  className="cm-product-gallery-image"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            );
          })}
        </div>

        {hasMultiple ? (
          <>
            <button
              type="button"
              className="cm-product-gallery-nav cm-product-gallery-nav--prev"
              onClick={goPrev}
              aria-label="Previous image"
            >
              <IconArrowRight size={18} className="cm-product-gallery-nav-icon--prev" />
            </button>
            <button
              type="button"
              className="cm-product-gallery-nav cm-product-gallery-nav--next"
              onClick={goNext}
              aria-label="Next image"
            >
              <IconArrowRight size={18} />
            </button>
            <p className="cm-product-gallery-counter" aria-live="polite">
              <span className="sr-only">Image </span>
              {activeIndex + 1} / {slides.length}
            </p>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div
          className="cm-product-gallery-thumbs"
          role="tablist"
          aria-label="Product images"
        >
          {slides.map((slide, index) => {
            const isSelected = index === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`View image ${index + 1}`}
                className={`cm-product-gallery-thumb${
                  isSelected ? ' cm-product-gallery-thumb--active' : ''
                }`}
                onClick={() => setActiveIndex(index)}
              >
                <img
                  src={slide.url}
                  alt=""
                  loading="lazy"
                  width={64}
                  height={64}
                />
              </button>
            );
          })}
        </div>
      ) : null}

      <span className="sr-only">
        {activeSlide.altText || title || 'Product image'}
      </span>
    </div>
  );
}
