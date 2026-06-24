# Package kit collections — b6dvzp-py.myshopify.com

## Collection types

| Type | How to mark in Admin | Example handle | On `/packages`? |
| ---- | -------------------- | -------------- | --------------- |
| **Trail package** | Admin theme template = `packages` **and** collection metafield `custom.theme_template` = `packages` (run sync script) | `tobavarchkhili-includes`, `ბორჯომის-ეროვნული-პარკის-კომპლექტი` | **Yes** |
| **Kit contents** | Same as trail package when theme template is `packages` — products in the collection are included gear | `tobavarchkhili-includes` | **Yes** (one card per package collection) |
| **Gear catalog** | Collection handle `individual-gear` | `individual-gear` | No (→ `/individual-gear`) |
| **Package listing (legacy)** | Collection handle `trail-packages` | `trail-packages` | No (product index only) |

The storefront loads **trail package collections** and filters with `isTrailPackageCollection` (`custom.theme_template` = `packages`). Products **in that collection** are the included items on package cards.

**After setting Admin theme template to `packages`**, run `scripts/sync-package-theme-metafields.graphql` so the Storefront API can see the flag (Admin `templateSuffix` is not exposed on Storefront).

Optional on each **trail package collection**:
- `custom.included_collection` → kit contents collection (gear + bundle pricing)
- `custom.trek`, `custom.duration`, `custom.difficulty` → filters on `/packages`

Package cards link to **`/collections/{handle}`**. Checkout product handle (optional) comes from `trail-packages` products linked via kit `included_collection`.

`custom.included_collection` on **products** remains the source of truth for PDP kit contents.

| Package product handle | Kit collection handle | Collection GID |
| ---------------------- | --------------------- | -------------- |
| `birtvisi-package` | `birtvisi-package-includes` | `gid://shopify/Collection/655392768292` |
| `tobavarchkhili` | `tobavarchkhili-includes` | `gid://shopify/Collection/655392801060` |
| `borjomi-package` | `ბორჯომის-ეროვნული-პარკის-კომპლექტი` | `gid://shopify/Collection/655429009700` |

Kit collections must be published to the **campmania** Hydrogen sales channel.

## CLI verification

```bash
shopify store auth --store b6dvzp-py.myshopify.com --scopes read_products,write_products,read_publications,write_publications
shopify store execute --store b6dvzp-py.myshopify.com --query-file scripts/queries/list-package-collections.graphql
shopify store execute --store b6dvzp-py.myshopify.com --query-file scripts/queries/list-trail-packages.graphql
shopify store execute --store b6dvzp-py.myshopify.com --query-file scripts/queries/kit-collection-details.graphql
```

## Setup / link mutations

- `scripts/setup-kit-collections-run.graphql` — create kit collections + metafield definition
- `scripts/link-package-kit-collections.graphql` — link birtvisi + tobavarchkhili
- `scripts/link-borjomi-package.graphql` — create borjomi package + link kit collection
- `scripts/publish-kit-collections.graphql` — publish kit collections to campmania channel

Legacy `custom.included_items` is ignored when kit collection products resolve.
