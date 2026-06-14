import {Link} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import type {ShopifyGearItem} from '~/lib/trailrent/shopify-catalog';
import {
  CATALOG_CARD_IMAGE_SIZES,
  catalogCardImageSrcSet,
  catalogCardImageUrl,
} from '~/lib/trailrent/catalog-image';
import {formatGel} from '~/lib/trailrent/pricing';

export function GearProductCard({
  item,
  loading = 'lazy',
}: {
  item: ShopifyGearItem;
  loading?: 'eager' | 'lazy';
}) {
  const {locale} = useLocale();
  const productUrl = item.productHandle
    ? `/products/${item.productHandle}`
    : null;

  const image = item.imageUrl ? (
    <img
      src={catalogCardImageUrl(item.imageUrl, 640, {crop: true}) ?? item.imageUrl}
      srcSet={catalogCardImageSrcSet(item.imageUrl, {crop: true})}
      sizes={CATALOG_CARD_IMAGE_SIZES}
      alt={item.imageAlt ?? item.title}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      loading={loading}
      decoding="async"
    />
  ) : (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-forest/20 to-moss/30 text-sage">
      {locale === 'ka' ? 'სურათი მალე' : 'Image coming soon'}
    </div>
  );

  const content = (
    <>
      <div className="cm-product-card-image">
        {image}
        {productUrl ? (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pine/70 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-mist">
              {locale === 'ka' ? 'დეტალები →' : 'View details →'}
            </span>
          </div>
        ) : null}
      </div>
      <div className="cm-product-card-body">
        <h3 className="font-display font-semibold leading-snug text-pine transition group-hover:text-forest">
          {item.title}
        </h3>
        <p className="mt-auto pt-2 text-xs font-semibold text-moss sm:pt-3 sm:text-sm">
          {formatGel(item.dailyRate)}
          <span className="ml-1 font-normal text-muted">
            {locale === 'ka' ? '/ დღე' : '/ day'}
          </span>
        </p>
      </div>
    </>
  );

  if (!productUrl) {
    return <div className="cm-product-card group">{content}</div>;
  }

  return (
    <Link
      to={productUrl}
      className="cm-product-card group"
      prefetch="intent"
    >
      {content}
    </Link>
  );
}
