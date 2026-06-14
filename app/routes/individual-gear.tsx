import type {Route} from './+types/individual-gear';
import {INDIVIDUAL_GEAR} from '~/lib/trailrent/catalog';
import {GearCatalogGrid} from '~/components/trailrent/GearCatalog';

export const meta: Route.MetaFunction = () => [
  {title: 'TrailRent | Individual Gear'},
];

export async function loader() {
  return {gear: INDIVIDUAL_GEAR};
}

export default function IndividualGearPage() {
  return <GearCatalogGrid gear={INDIVIDUAL_GEAR} />;
}
