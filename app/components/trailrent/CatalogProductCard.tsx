import type {ReactNode} from 'react';
import {Link} from 'react-router';
import {CatalogCardImage} from '~/components/trailrent/CatalogCardImage';
import {ProductCardImageScrubber} from '~/components/trailrent/ProductCardImageScrubber';
import {IconArrowRight} from '~/components/trailrent/Icons';

export function CatalogProductCard({
  title,
  to,
  imageUrl,
  imageUrls,
  imageAlt,
  price,
  loading = 'lazy',
  variant = 'product',
  imageFit,
}: {
  title: string;
  to?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  imageAlt?: string;
  price: ReactNode;
  loading?: 'eager' | 'lazy';
  variant?: 'product' | 'package';
  imageFit?: 'cover' | 'contain';
}) {
  const fit =
    imageFit ?? (variant === 'package' ? 'cover' : 'contain');
  const images =
    imageUrls?.length ? imageUrls : imageUrl ? [imageUrl] : [];
  const cardClass =
    variant === 'package' ? 'cm-kit-card--package' : 'cm-kit-card--product';

  const inner = (
    <>
      <div className="cm-kit-card-media relative overflow-hidden">
        {images.length > 1 ? (
          <ProductCardImageScrubber
            images={images}
            alt={imageAlt ?? title}
            fit={fit}
          />
        ) : images.length === 1 ? (
          <CatalogCardImage
            src={images[0]}
            alt={imageAlt ?? title}
            fit={fit}
            loading={loading}
          />
        ) : (
          <div className="cm-kit-card-pattern absolute inset-0 bg-gradient-to-br from-stone via-mist to-sage/20 opacity-80" />
        )}
      </div>
      <div className="cm-kit-card-body">
        <h3 className="cm-kit-card-title">{title}</h3>
        <div className="cm-kit-card-footer">
          <div className="cm-kit-card-pricing min-w-0">{price}</div>
          <span className="cm-kit-card-arrow" aria-hidden>
            <IconArrowRight size={16} className="sm:hidden" />
            <IconArrowRight size={18} className="hidden sm:block" />
          </span>
        </div>
      </div>
    </>
  );

  if (!to) {
    return <article className={`cm-kit-card ${cardClass}`}>{inner}</article>;
  }

  return (
    <article className={`cm-kit-card ${cardClass} group`}>
      <Link
        to={to}
        className="cm-kit-card-link no-underline hover:no-underline"
        prefetch="intent"
      >
        {inner}
      </Link>
    </article>
  );
}
