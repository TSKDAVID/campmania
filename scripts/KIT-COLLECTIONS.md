# Package kit collections — b6dvzp-py.myshopify.com

`custom.included_collection` (collection_reference, Storefront `PUBLIC_READ`) is the **source of truth**.
Convention `{package-handle}-includes` is only used when the metafield is unset.

| Package product handle | Kit collection handle | Collection GID |
| ---------------------- | --------------------- | -------------- |
| `birtvisi-package` | `birtvisi-package-includes` | `gid://shopify/Collection/655392768292` |
| `tobavarchkhili` | `tobavarchkhili-includes` | `gid://shopify/Collection/655392801060` |
| `borjomi-package` | `ბორჯომის-ეროვნული-პარკის-კომპლექტი` | `gid://shopify/Collection/655429009700` |

Kit collections must be published to the **campmania** Hydrogen sales channel.

## CLI verification

```bash
shopify store auth --store b6dvzp-py.myshopify.com --scopes read_products,write_products,read_publications,write_publications
shopify store execute --store b6dvzp-py.myshopify.com --query-file scripts/queries/list-trail-packages.graphql
shopify store execute --store b6dvzp-py.myshopify.com --query-file scripts/queries/kit-collection-details.graphql
```

## Setup / link mutations

- `scripts/setup-kit-collections-run.graphql` — create kit collections + metafield definition
- `scripts/link-package-kit-collections.graphql` — link birtvisi + tobavarchkhili
- `scripts/link-borjomi-package.graphql` — create borjomi package + link kit collection
- `scripts/publish-kit-collections.graphql` — publish kit collections to campmania channel

Legacy `custom.included_items` is ignored when kit collection products resolve.
