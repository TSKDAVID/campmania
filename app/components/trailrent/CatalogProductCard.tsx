import type {ReactNode} from 'react';
import {Link} from 'react-router';
import {CatalogCardImage} from '~/components/trailrent/CatalogCardImage';
import {IconArrowRight} from '~/components/trailrent/Icons';

export function CatalogProductCard({
  title,
  to,
  imageUrl,
  imageAlt,
  price,
  loading = 'lazy',
}: {
  title: string;
  to?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  price: ReactNode;
  loading?: 'eager' | 'lazy';
}) {
  const inner = (
    <>
      <div className="cm-kit-card-media relative overflow-hidden">
        {imageUrl ? (
          <CatalogCardImage
            src={imageUrl}
            alt={imageAlt ?? title}
            fit="contain"
            loading={loading}
          />
        ) : (
          <div className="cm-kit-card-pattern absolute inset-0 bg-gradient-to-br from-stone via-mist to-sage/20 opacity-80" />
        )}
      </div>
      <div className="cm-kit-card-body">
        <h3 className="cm-kit-card-title">{title}</h3>
        <div className="cm-kit-card-footer">
          <p className="cm-kit-card-price">{price}</p>
          <span className="cm-kit-card-arrow" aria-hidden>
            <IconArrowRight size={18} />
          </span>
        </div>
      </div>
    </>
  );

  if (!to) {
    return <article className="cm-kit-card cm-kit-card--product">{inner}</article>;
  }

  return (
    <article className="cm-kit-card cm-kit-card--product group">
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
