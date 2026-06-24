# Campmania Visual Redesign — Phase 0 Audit

Hydrogen headless storefront (React Router 7). No Liquid theme files.

## Route modules (36)

| Route | File |
|-------|------|
| `/` | `app/routes/_index.tsx` |
| `/products/:handle` | `app/routes/products.$handle.tsx` |
| `/packages` | `app/routes/packages.tsx` |
| `/individual-gear` | `app/routes/individual-gear.tsx` |
| `/gear-builder` | `app/routes/gear-builder.tsx` |
| `/collections/*` | `collections.$handle.tsx`, `collections.all.tsx`, `collections._index.tsx` |
| `/cart` | `app/routes/cart.tsx` |
| `/cart/:lines` | `app/routes/cart.$lines.tsx` |
| `/search` | `app/routes/search.tsx` |
| `/pages/:handle` | `app/routes/pages.$handle.tsx` |
| `/pages/contact` | `app/routes/pages.contact.tsx` |
| `/pages/faq` | `app/routes/pages.faq.tsx` |
| `/pages/how-it-works` | `app/routes/pages.how-it-works.tsx` |
| `/pages/about` | `app/routes/pages.about.tsx` |
| `/blogs/*` | `blogs._index.tsx`, `blogs.$blogHandle._index.tsx`, `blogs.$blogHandle.$articleHandle.tsx` |
| `/account/*` | `account.tsx` + child routes |
| Checkout | External via `cart.checkoutUrl` |

## Feature preservation table

| Feature | Template/File | Dependency | Must survive |
|---------|---------------|------------|--------------|
| Root cart data | `root.tsx` | `cart.get()`, `CART_QUERY_FRAGMENT` | ✓ |
| Cart drawer open/close | `Aside.tsx`, `Header.tsx` | `useAside()`, translateX CSS | ✓ |
| Add to cart (PDP) | `RentalProductForm.tsx` | `CartForm LinesAdd`, line attributes | ✓ |
| Add to cart (gear builder) | `gear-builder.tsx` | `buildGearBuilderCartLines()` | ✓ |
| Cart line update/remove | `CartLineItem.tsx` | `LinesUpdate`, `LinesRemove` | ✓ |
| Cart page mutations | `cart.tsx` action | All `CartForm.ACTIONS` | ✓ |
| Deep-link checkout | `cart.$lines.tsx` | `cart.create()` → `checkoutUrl` | ✓ |
| Checkout handoff | `CartSummary.tsx` | `<a href={checkoutUrl}>` | ✓ |
| Delivery toggle (PDP) | `DeliverySelector.tsx` | Line item attributes | ✓ |
| Delivery toggle (drawer) | `CartMain.tsx` | Local state + display fee | ✓ |
| Metro station picker | `DeliverySelector.tsx` | `TBILISI_METRO_STATIONS` | ✓ |
| Rental date picker | `RentalDateRangePicker.tsx` | Date attrs on add | ✓ |
| Rent vs purchase mode | `RentalProductForm.tsx` | `fulfillment_mode` attribute | ✓ |
| Product metafields | `products.$handle.tsx` | `custom.*`, `gear_builder.*` | ✓ |
| Collection handles | `shopify-catalog.ts` | `trail-packages`, `individual-gear` | ✓ |
| Gear builder metafields | `gear-builder/parse.ts` | `gear_builder.*` namespace | ✓ |
| Homepage promo metaobjects | `homepagePromo.ts` | `homepage_promo_slide` | ✓ |
| KA/EN toggle | `LocaleProvider`, `LanguageSwitcher` | Cookie + `i18n.ts` | ✓ |
| Blog from Shopify | `blogs.*.tsx` | Storefront blog queries | ✓ |
| CMS pages | `pages.$handle.tsx` | `page.body` HTML | ✓ |
| Customer account | `account.*.tsx` | Customer Account API | ✓ |
| Search | `search.tsx` | Storefront search queries | ✓ |
| Analytics | `root.tsx` | Hydrogen `Analytics.Provider` | ✓ |

## Cart drawer

- Opens: Header bag icon → `open('cart')`
- Closes: ×, Escape, overlay, nav links
- Data: root loader `cart.get()` + `useOptimisticCart()`
- Animation: CSS `translateX` only

## Delivery UI

- **PDP**: `DeliverySelector` → `buildLineAttributes()` persists to Shopify line attributes
- **Cart drawer**: local React state; display fee only (+7 GEL home)
