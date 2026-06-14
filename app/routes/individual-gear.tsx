import {useLoaderData} from 'react-router';
import type {Route} from './+types/individual-gear';
import {INDIVIDUAL_GEAR} from '~/lib/trailrent/catalog';
import {GearCatalogGrid} from '~/components/trailrent/GearCatalog';
import {
  loadShopifyGear,
  type ShopifyGearItem,
} from '~/lib/trailrent/shopify-catalog';
import {getLocaleFromRequest} from '~/providers/LocaleProvider';

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Individual Gear'},
];

export async function loader({context, request}: Route.LoaderArgs) {
  const locale = getLocaleFromRequest(request);
  const shopifyGear = await loadShopifyGear(context.storefront, locale).catch(
    () => [] as ShopifyGearItem[],
  );

  if (shopifyGear.length > 0) {
    return {gear: shopifyGear, shopifyConnected: true};
  }

  return {
    gear: INDIVIDUAL_GEAR as ShopifyGearItem[],
    shopifyConnected: false,
  };
}

export default function IndividualGearPage() {
  const {gear, shopifyConnected} = useLoaderData<typeof loader>();
  return (
    <GearCatalogGrid gear={gear} shopifyConnected={shopifyConnected} />
  );
}
