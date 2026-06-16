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

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Trail Packages'},
];

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
    packages: TRAIL_PACKAGES as ShopifyPackageItem[],
    gear: INDIVIDUAL_GEAR as ShopifyGearItem[],
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
