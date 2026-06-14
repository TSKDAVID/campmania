import {useLoaderData} from 'react-router';
import type {Route} from './+types/packages';
import {TRAIL_PACKAGES} from '~/lib/trailrent/catalog';
import {PackageCatalogGrid} from '~/components/trailrent/PackageCatalog';
import {
  loadShopifyPackages,
  type ShopifyPackageItem,
} from '~/lib/trailrent/shopify-catalog';
import {getLocaleFromRequest} from '~/providers/LocaleProvider';

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Trail Packages'},
];

export async function loader({context, request}: Route.LoaderArgs) {
  const locale = getLocaleFromRequest(request);
  const shopifyPackages = await loadShopifyPackages(
    context.storefront,
    locale,
  ).catch(() => [] as ShopifyPackageItem[]);

  if (shopifyPackages.length > 0) {
    return {packages: shopifyPackages, shopifyConnected: true};
  }

  return {
    packages: TRAIL_PACKAGES as ShopifyPackageItem[],
    shopifyConnected: false,
  };
}

export default function PackagesPage() {
  const {packages, shopifyConnected} = useLoaderData<typeof loader>();
  return (
    <PackageCatalogGrid
      packages={packages}
      shopifyConnected={shopifyConnected}
    />
  );
}
