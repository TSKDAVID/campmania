# Campmania Editorial Rebuild - Phase 1 Baseline

This document is the hard baseline contract for the editorial rebuild.
Presentation can change completely; routing, data, and business behavior must remain unchanged.

## Route and Entry Inventory

### Runtime entry points
- `app/root.tsx`
- `app/routes.ts`
- `server.ts`
- `app/entry.client.tsx`
- `app/entry.server.tsx`

### Core customer-facing routes
- `/` -> `app/routes/_index.tsx`
- `/packages` -> `app/routes/packages.tsx`
- `/individual-gear` -> `app/routes/individual-gear.tsx`
- `/collections/:handle` -> `app/routes/collections.$handle.tsx`
- `/products/:handle` -> `app/routes/products.$handle.tsx`
- `/search` -> `app/routes/search.tsx`
- `/cart` -> `app/routes/cart.tsx`
- `/cart/:lines` -> `app/routes/cart.$lines.tsx`
- `/discount/:code` -> `app/routes/discount.$code.tsx`
- `/gear-builder` -> `app/routes/gear-builder.tsx`
- `/pages/how-it-works`, `/pages/faq`, `/pages/contact`, `/pages/:handle`
- `/blogs`, `/blogs/:blogHandle`, `/blogs/:blogHandle/:articleHandle`
- `/policies`, `/policies/:handle`
- Account routes under `/account*`

### Dynamic and query contracts
- Dynamic params: `:handle`, `:blogHandle`, `:articleHandle`, `:lines`, `:code`, `:id`, `:version`
- Query params in active UX contracts:
  - `/packages?trek=&duration=&difficulty=`
  - `/individual-gear?gear=`
  - `/search?q=&predictive=`
  - `/gear-builder?build=&new=`
  - `/discount/:code?redirect=&return_to=`
  - `/cart/:lines?discount=`
  - Product option params in `/products/:handle`

## State, Hooks, Providers, and Event Chains

### Providers (must remain wired)
- `LocaleProvider` (`locale`, cookie write/read, translations)
- `GearBuilderProvider` (builder slots, product assignment, persistence)
- `Aside.Provider` (drawer state for cart/mobile/search)

### Critical local state patterns (must be preserved)
- Catalog filter states via `useSearchParams`
- Product fulfillment mode (`rent` / `purchase`)
- Rental booking inputs (`startDate`, `endDate`, `deliveryOption`, `metroId`, `deliveryAddress`)
- Package card duration selector (`selectedDuration`)
- Hero/carousel active index states
- Cart UI delivery/local display states

### Critical callback/event chains (must remain equivalent)
- Add to cart via `CartForm` (`/cart` action)
- Cart drawer open/close via `useAside()`
- Filter toggles mutating URL params
- Rental day calculations and total pricing updates
- Gear builder save/update/load flow
- Variant URL option sync on PDP (`useSelectedOptionInUrlParam`)

## Data Fetching and API Surface

### Shopify Storefront GraphQL (must remain unchanged)
- Header/footer and cart fragments in `app/lib/fragments.ts`
- Catalog queries in `app/graphql/storefront/CatalogProductsQuery.ts`
- PDP query in `app/routes/products.$handle.tsx`
- Search queries in `app/routes/search.tsx`
- Homepage promo metaobject query in `app/lib/trailrent/homepagePromo.ts`

### Customer Account API (must remain unchanged)
- Customer details/rental history/orders queries in `app/graphql/customer-account/*`
- Address/profile mutations in `app/graphql/customer-account/*`

### Contractual UI data fields (must remain consumed)
- Package fields: trek/duration/difficulty labels and values, price fields, compare-at values, savings, included products
- Gear fields: category, daily price, compare-at price, image arrays, product handles
- Cart line attributes: rental dates/days, quoted pricing, fulfillment mode, delivery fields, builder/package attributes

## Screenshot Feature Checklist Baseline

The following feature set is treated as mandatory parity based on current implementation and the provided references:

- `F001` Header with brand, navigation, locale switch, search link, account link, cart counter
- `F002` Homepage hero with large typographic block + media/promo panel
- `F003` Homepage featured gear strip with price and compare-at display
- `F004` Curated package showcase/cards with link-through behavior
- `F005` Category matrix links to pre-filtered gear routes
- `F006` Package catalog with trek/duration/difficulty filters
- `F007` Mobile filter sheet and desktop filter panel parity
- `F008` Package cards with duration selector and recomputed totals
- `F009` Gear catalog with category filter chips and product cards
- `F010` Collection page dual mode (package collection page vs generic collection listing)
- `F011` Product page with image gallery, included items, and booking form
- `F012` Rental/purchase mode toggle with price-state synchronization
- `F013` Cart drawer with visible line counting and summary calculations
- `F014` Currency/price output consistency (including compare-at and derived totals)
- `F015` Search page flow and result rendering
- `F016` Locale cookie behavior (`ka`/`en`) and translated labels
- `F017` Discount/cart deep-link route behaviors
- `F018` Gear builder entry points and state persistence wiring

## Non-Regression Guardrails

- No route paths removed or renamed.
- No query key renamed.
- No loader/action removed.
- No `CartForm` action semantics changed.
- No API fragment/query field removed from live render paths.
- No state mutation callbacks dropped from rebuilt components.
