import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {useLocale} from '~/providers/LocaleProvider';

export function ProductItem({
  product,
  loading,
}: {
  product: CollectionItemFragment | ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const {locale} = useLocale();
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  return (
    <Link
      className="cm-product-card"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="cm-product-card-image">
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="4/5"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            data={image}
            loading={loading}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-forest/20 to-moss/30 text-sage">
            {locale === 'ka' ? 'სურათი მალე' : 'Image coming soon'}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pine/70 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-mist">
            {locale === 'ka' ? 'დეტალები →' : 'View details →'}
          </span>
        </div>
      </div>
      <div className="cm-product-card-body">
        <h3 className="font-display text-lg font-semibold leading-snug text-pine transition group-hover:text-forest">
          {product.title}
        </h3>
        <p className="mt-auto pt-3 text-sm font-semibold text-moss">
          <Money data={product.priceRange.minVariantPrice} />
          <span className="ml-1 font-normal text-muted">
            {locale === 'ka' ? '/ დღე' : '/ day'}
          </span>
        </p>
      </div>
    </Link>
  );
}
