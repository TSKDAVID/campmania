import {Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {CatalogProductCard} from '~/components/trailrent/CatalogProductCard';
import {PriceWithCompare} from '~/components/trailrent/PriceWithCompare';
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
  const dailyRate = Number(product.priceRange.minVariantPrice.amount);
  const compareAtAmount = (
    product as {
      compareAtPriceRange?: {minVariantPrice?: {amount?: string}} | null;
    }
  ).compareAtPriceRange?.minVariantPrice?.amount;
  const compareAt = compareAtAmount ? Number(compareAtAmount) : undefined;
  const perDay = locale === 'ka' ? '/ დღე' : '/ day';

  return (
    <CatalogProductCard
      key={product.id}
      to={variantUrl}
      title={product.title}
      imageUrl={image?.url}
      imageAlt={image?.altText ?? product.title}
      loading={loading}
      price={
        dailyRate > 0 ? (
          <PriceWithCompare
            amount={dailyRate}
            compareAtAmount={compareAt}
            suffix={` ${perDay}`}
          />
        ) : (
          <>
            <Money data={product.priceRange.minVariantPrice} />
            <span className="ml-1 text-sm font-normal text-muted">{perDay}</span>
          </>
        )
      }
    />
  );
}
