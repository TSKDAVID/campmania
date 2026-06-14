import {Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {CatalogProductCard} from '~/components/trailrent/CatalogProductCard';
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
    <CatalogProductCard
      key={product.id}
      to={variantUrl}
      title={product.title}
      imageUrl={image?.url}
      imageAlt={image?.altText ?? product.title}
      loading={loading}
      price={
        <>
          <Money data={product.priceRange.minVariantPrice} />
          <span className="ml-1 text-sm font-normal text-muted">
            {locale === 'ka' ? '/ დღე' : '/ day'}
          </span>
        </>
      }
    />
  );
}
