import {useLoaderData} from 'react-router';
import type {Route} from './+types/packages';
import {INDIVIDUAL_GEAR, TRAIL_PACKAGES} from '~/lib/trailrent/catalog';
import {PackageCatalogGrid} from '~/components/trailrent/PackageCatalog';
import {
  loadShopifyGear,
  loadShopifyPackages,
  type ShopifyGearItem,
  type ShopifyPackageItem,
} from '~/lib/trailrent/shopify-catalog';
import {getLocaleFromRequest} from '~/providers/LocaleProvider';
import {CATALOG_PAGE_HEADERS} from '~/lib/trailrent/storefront-live';
import {parseItemType, type GearBuilderProduct} from '~/lib/trailrent/gear-builder';

function mapDemoGearItem(item: (typeof INDIVIDUAL_GEAR)[number]): ShopifyGearItem {
  const itemType = parseItemType(
    item.category === 'sleeping' ? 'sleeping_bag' : item.category,
  );
  const builderProduct: GearBuilderProduct = {
    id: item.id,
    handle: item.productHandle ?? item.id,
    title: item.title,
    dailyRate: item.dailyRate,
    variantId: undefined,
    availableForSale: true,
    metafields: {
      itemType,
      builderEnabled: true,
      durationFit: ['1-day', '2-day', 'weekend'],
      thumbnailPriority: 0,
    },
    variants: [],
  };

  return {
    ...item,
    productId: item.id,
    builderProduct,
  };
}

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Trail Packages'},
];

export function shouldRevalidate() {
  return true;
}

export function headers() {
  return CATALOG_PAGE_HEADERS;
}

export async function loader({context, request}: Route.LoaderArgs) {
  const locale = getLocaleFromRequest(request);
  const [shopifyPackages, shopifyGear] = await Promise.all([
    loadShopifyPackages(
      context.storefront,
      locale,
    ).catch(() => [] as ShopifyPackageItem[]),
    loadShopifyGear(
      context.storefront,
      locale,
    ).catch(() => [] as ShopifyGearItem[]),
  ]);

  if (shopifyPackages.length > 0) {
    return {
      packages: shopifyPackages,
      gear: shopifyGear,
      shopifyConnected: true,
    };
  }

  return {
    packages: TRAIL_PACKAGES.map((pkg) => ({
      ...pkg,
      productId: pkg.id,
      includedProductHandles: [],
      includedCollectionProducts: [] as GearBuilderProduct[],
      defaultDuration: (pkg.duration as ShopifyPackageItem['defaultDuration']) ?? '2-day',
    })) as ShopifyPackageItem[],
    gear: INDIVIDUAL_GEAR.map(mapDemoGearItem),
    shopifyConnected: false,
  };
}

export default function PackagesPage() {
  const {packages, gear, shopifyConnected} = useLoaderData<typeof loader>();
  return (
    <PackageCatalogGrid
      packages={packages}
      gear={gear}
      shopifyConnected={shopifyConnected}
    />
  );
}
