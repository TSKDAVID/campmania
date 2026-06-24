import {Link} from 'react-router';
import {Button} from './Button';

type ProductCardProps = {
  to: string;
  title: string;
  price?: React.ReactNode;
  imageUrl?: string | null;
  imageAlt?: string;
  loading?: 'lazy' | 'eager';
  ctaLabel?: string;
  onCtaClick?: () => void;
};

export function ProductCard({
  to,
  title,
  price,
  imageUrl,
  imageAlt,
  loading = 'lazy',
  ctaLabel = 'Rent',
  onCtaClick,
}: ProductCardProps) {
  return (
    <article className="cm-product-card">
      <Link to={to} className="cm-product-card__media">
        {imageUrl ? (
          <img src={imageUrl} alt={imageAlt ?? title} loading={loading} />
        ) : (
          <div className="cm-img-placeholder" aria-hidden />
        )}
      </Link>
      <div className="cm-product-card__body">
        <Link to={to}>
          <h3 className="cm-product-card__title">{title}</h3>
        </Link>
        {price ? <p className="cm-product-card__price">{price}</p> : null}
        <div className="cm-product-card__cta">
          <Button to={to} variant="outline" fullWidth onClick={onCtaClick}>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
