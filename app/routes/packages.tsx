import type {Route} from './+types/packages';
import {TRAIL_PACKAGES} from '~/lib/trailrent/catalog';
import {PackageCatalogGrid} from '~/components/trailrent/PackageCatalog';

export const meta: Route.MetaFunction = () => [
  {title: 'TrailRent | Trail Packages'},
];

export async function loader() {
  return {packages: TRAIL_PACKAGES};
}

export default function PackagesPage() {
  return <PackageCatalogGrid packages={TRAIL_PACKAGES} />;
}
