import type {Storefront} from '@shopify/hydrogen';

/** Always fetch fresh catalog data from Shopify (no Hydrogen worker cache). */
export function liveStorefrontCache(storefront: Storefront) {
  return {cache: storefront.CacheNone()} as const;
}

export const CATALOG_PAGE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
} as const;
