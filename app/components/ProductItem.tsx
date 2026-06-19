import {Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {CatalogProductCard} from '~/components/trailrent/CatalogProductCard';
import {PriceWithCompare} from '~/components/trailrent/PriceWithCompare';
import {collectProductMediaImageUrls} from '~/lib/trailrent/catalog-image';
import {useVariantUrl} from '~/lib/variants';
import {useLocale} from '~/providers/LocaleProvider';

type ProductCardSource = (CollectionItemFragment | ProductItemFragment) & {
  media?: {
    nodes?: Array<{image?: {url?: string | null} | null}> | null;
  } | null;
};

export function ProductItem({
  product,
  loading,
}: {
  product: ProductCardSource;
  loading?: 'eager' | 'lazy';
}) {
  const {locale} = useLocale();
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const imageUrls = collectProductMediaImageUrls(product);
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
      imageUrls={imageUrls}
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
