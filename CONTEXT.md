# Campmania — Project Context

> **Purpose of this file:** Onboard a new AI chat (or developer) quickly. Read this first before changing code.

---

## What this is

**Campmania** is a **commerce-first outdoor gear rental storefront** for Tbilisi, Georgia — similar in spirit to [campshare.ge](https://campshare.ge). Customers rent **trail packages** (full kits) or **individual gear** (à la carte), pick up at metro stations, and book via date-range rental flows.

This is **not** a generic SaaS landing site. The UI should feel like a **shop**: product grids, filters, PDP booking forms, cart/checkout — not long marketing sections blocking the catalog.

| Item | Value |
|------|--------|
| **Brand** | Campmania (internal code folder name: `trailrent`) |
| **Workspace path** | `c:\Users\Lenovo\Desktop\rentmania\campmania` |
| **GitHub** | https://github.com/TSKDAVID/campmania (`main` branch) |
| **Shopify store** | `b6dvzp-py.myshopify.com` |
| **Hosting** | Shopify **Oxygen** (auto-deploy on push to `main`) |
| **Oxygen preview** | `https://campmania-4c29d91072afb5138da1.o2.myshopify.dev` (may change after redeploy) |
| **Default language** | Georgian (`ka`), with English (`en`) toggle |
| **Currency** | GEL (₾) |

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **Shopify Hydrogen** `2026.4.3` on **React Router** `7.16` |
| Runtime | Oxygen (Workers) via `@shopify/mini-oxygen` locally |
| Styling | **Tailwind CSS v4** + custom design system in `app/styles/trailrent.css` |
| API | Shopify **Storefront API** (catalog/cart) + **Customer Account API** (login/orders) |
| GraphQL | `app/graphql/` + codegen → `storefrontapi.generated` types |
| Node | `^22 \|\| ^24` |

### Commands

```bash
cd campmania
npm install
npx shopify hydrogen env pull   # first time / refresh tokens → writes .env
npm run dev                     # local dev
npm run build                   # production build (run before push if unsure)
npm run typecheck
npx shopify hydrogen deploy     # manual Oxygen deploy (usually GitHub auto-deploys)
```

**Never commit `.env`.** Copy from `.env.example` or use `hydrogen env pull`.

---

## Repository layout

```
campmania/
├── app/                          # ← All storefront code lives here
│   ├── routes/                   # React Router file-based routes
│   ├── components/               # Shared UI (Header, Cart, Aside, etc.)
│   │   └── trailrent/            # Campmania-specific UI (catalog, home, booking)
│   ├── lib/
│   │   └── trailrent/            # Business logic, i18n, catalog, pricing
│   ├── graphql/                  # Storefront + Customer Account queries
│   ├── providers/                # LocaleProvider, etc.
│   ├── styles/
│   │   ├── trailrent.css         # ★ Main design system (cm-* classes)
│   │   ├── tailwind.css          # Tailwind entry
│   │   ├── app.css               # Legacy Hydrogen styles (minimal overrides)
│   │   └── reset.css
│   ├── root.tsx                  # Root loader, fonts, LocaleProvider, PageLayout
│   └── entry.client.tsx / entry.server.tsx
├── content/                      # Markdown copy (pages, emails, checklists) — not rendered by Hydrogen directly for most routes
├── docs/                         # Shopify Admin setup guides (01–10)
├── templates/                    # Product CSV import templates
├── CONTEXT.md                    # ← This file
└── README.md                     # Dev setup + customer login instructions
```

---

## Routes map (what users see)

| URL | File | What it does |
|-----|------|----------------|
| `/` | `routes/_index.tsx` | Homepage — `HomeCommerce.tsx` (shop tiles, hero, categories) |
| `/packages` | `routes/packages.tsx` | Trail package catalog grid + filters |
| `/individual-gear` | `routes/individual-gear.tsx` | Individual gear catalog grid + category chips |
| `/products/:handle` | `routes/products.$handle.tsx` | PDP — gallery, rental booking form, kit contents |
| `/pages/how-it-works` | `routes/pages.how-it-works.tsx` | Static content page |
| `/pages/faq` | `routes/pages.faq.tsx` | FAQ from `lib/trailrent/faq-content.ts` |
| `/pages/contact` | `routes/pages.contact.tsx` | Contact page |
| `/pages/:handle` | `routes/pages.$handle.tsx` | Generic Shopify pages |
| `/cart` | `routes/cart.tsx` | Cart |
| `/account/*` | `routes/account*.tsx` | Customer account (Shopify Customer Account API) |
| `/collections/*` | `routes/collections.*.tsx` | Standard Hydrogen collections (secondary to custom catalogs) |
| `/search` | `routes/search.tsx` | Search |

**Primary nav** is hardcoded in `Header.tsx` → `useCampmaniaNav()` — **not** the Shopify admin menu.

---

## Shopify data model

### Collections (required for live catalog)

Defined in `app/lib/trailrent/shopify-catalog.ts`:

| Handle | Purpose |
|--------|---------|
| `trail-packages` | Package/kit products |
| `individual-gear` | Single-item rental products |

If collections are empty, routes fall back to **demo data** in `app/lib/trailrent/catalog.ts` (`TRAIL_PACKAGES`, `INDIVIDUAL_GEAR`) and show an amber setup hint banner.

### Product tags (drive filters)

| Tag prefix | Example | Used on |
|------------|---------|---------|
| `trek-` | `trek-tobavarchkhili` | Packages |
| `duration-` | `duration-2-day` | Packages |
| `difficulty-` | `difficulty-moderate` | Packages |
| `gear-` | `gear-sleeping` | Individual gear |

Filter option labels: `TREK_FILTERS`, `DURATION_FILTERS`, `DIFFICULTY_FILTERS`, `GEAR_FILTERS` in `catalog.ts`.

### Metafields (packages)

Namespace `custom` — queried in `app/graphql/storefront/CatalogProductsQuery.ts`:

| Key | Purpose |
|-----|---------|
| `included_items` | JSON array or newline list of kit items |
| `kit_summary` | Short kit description for cards/PDP |

### Loyalty tier

Customer tag `tier:trail-tested` → **Trail Tested VIP** perks. Logic in `lib/trailrent/loyalty.ts`, displayed on account + PDP.

### Customer login

Uses **Shopify Customer Account API** (OAuth). Callback URLs must match Oxygen domain — see `README.md` and `npm run auth:push` script in `package.json`. **Localhost callbacks do not work** — test login on Oxygen preview URL.

---

## Architecture: how catalog pages work

```
Route loader (packages.tsx / individual-gear.tsx)
    ↓
loadShopifyPackages() / loadShopifyGear()  ← shopify-catalog.ts
    ↓ (or fallback)
TRAIL_PACKAGES / INDIVIDUAL_GEAR demo data  ← catalog.ts
    ↓
PackageCatalogGrid / GearCatalogGrid        ← components/trailrent/
    ↓
CatalogCardImage + trailrent.css cm-kit-card-* styles
```

**Locale** is read server-side via `getLocaleFromRequest()` (cookie `trailrent_locale`) and client-side via `useLocale()` from `LocaleProvider`.

**All user-facing strings** should go through `app/lib/trailrent/i18n.ts` — do not hardcode Georgian/English in components.

---

## Key components (where to edit what)

### Layout shell

| File | Role |
|------|------|
| `app/components/PageLayout.tsx` | Wraps every page: Header, Footer, cart/search/mobile asides |
| `app/components/Header.tsx` | Sticky nav, cart, language switcher, mobile menu |
| `app/components/Footer.tsx` | Site footer |
| `app/components/Aside.tsx` | Slide-out panels (cart, search, mobile nav) |

### Campmania UI (`app/components/trailrent/`)

| File | Role |
|------|------|
| `HomeCommerce.tsx` | Homepage shop-first layout |
| `HomeSections.tsx` | `CatalogPageHeading`, `PageBanner`, `LanguageSwitcher`, trust sections |
| `PackageCatalog.tsx` | Package cards + grid layout |
| `GearCatalog.tsx` | Gear cards + category filter bar |
| `CatalogFilters.tsx` | Package sidebar (desktop) + bottom sheet (mobile); gear chip bar |
| `CatalogCardImage.tsx` | Optimized card images (`fit: contain \| cover`) |
| `ProductPageSections.tsx` | PDP blocks (trust bar, included panel, price) |
| `RentalProductForm.tsx` | Date range, metro, add-to-cart on PDP |
| `BookingWidget.tsx` | Standalone booking widget (if used) |
| `Icons.tsx` | SVG icon components |

### Business logic (`app/lib/trailrent/`)

| File | Role |
|------|------|
| `i18n.ts` | All translations (`ka` + `en`) |
| `catalog.ts` | Demo products + filter constants |
| `shopify-catalog.ts` | Shopify collection loaders + product mapping |
| `catalog-image.ts` | CDN image URL helpers (crop vs width-only) |
| `pricing.ts` | `formatGel()` and rental math |
| `metro.ts` | Tbilisi metro pickup stations |
| `loyalty.ts` | Trusted tier checks |
| `rent-to-own.ts` | Rent-to-own offer builder on PDP |
| `customer-rental-context.ts` | Logged-in customer rental history for PDP |
| `faq-content.ts` | FAQ Q&A content |

### Product PDP

`routes/products.$handle.tsx` loads Shopify product + parses `included_items` metafield. Uses `RentalProductForm` (not default Hydrogen `ProductForm`).

---

## Design system & CSS conventions

**Primary stylesheet:** `app/styles/trailrent.css` (imported in `root.tsx`).

### CSS variables (`@theme` in trailrent.css)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-pine` | `#0d2818` | Dark green, headings |
| `--color-forest` | `#1a3d2e` | Buttons, active states |
| `--color-moss` | `#4a7c59` | Accents, links |
| `--color-sage` | `#8faf9a` | Muted green text |
| `--color-mist` | `#f0f4f1` | Page background |
| `--color-stone` | `#e4eae6` | Borders, dividers |
| `--color-amber` | `#d4a574` | Highlights |
| `--header-height` | `72px` | Sticky header offset |
| `--site-top-height` | `var(--header-height)` | Used for sticky filters |

### Class prefix: `cm-*`

Campmania components use **`cm-` prefixed classes** defined in `trailrent.css` — e.g. `cm-kit-card`, `cm-catalog-grid`, `cm-filter-sheet`, `cm-product-layout`.

### Tailwind v4 pitfalls (already hit in this project)

- **Do not** `@apply group` or `group-hover:` inside CSS files — use parent `:hover` selectors instead.
- Prefer `cm-*` component classes over scattering utility classes for catalog cards.
- Page width container: `.tr-page-width` (max-w-7xl, responsive padding).

### Current catalog card design (as of latest commits)

- **Vertical cards**, image on top, text below, **3:4 aspect ratio** (`aspect-[3/4]`).
- Images use **`object-contain`** with **white** media background (edge-to-edge, no grey side gutters).
- Cards: title + price + arrow; whole card is clickable `Link`.
- **Packages on desktop hover:** card lifts, reveals description + included items list.
- **No announcement bar** (removed).
- Catalog pages use minimal **`CatalogPageHeading`** (`<h1>` only) — **no** large `PageBanner` hero on `/packages` or `/individual-gear`.
- `PageBanner` still used on FAQ, contact, how-it-works, collections.

### Filter UX

| Page | Desktop | Mobile |
|------|---------|--------|
| Individual gear | Sticky horizontal chip bar | Scrollable chips, **not sticky** |
| Packages | Sticky left sidebar panel | **Filter button** → bottom sheet; active filter chips removable |

---

## i18n

- **Default locale:** `ka` (Georgian)
- **Cookie:** `trailrent_locale=ka|en`
- **Provider:** `app/providers/LocaleProvider.tsx`
- **Strings:** `app/lib/trailrent/i18n.ts` — add keys to **both** `ka` and `en` objects
- **Usage:** `const {translations: tr, locale} = useLocale()` → `tr.packages.title`

---

## GraphQL

| Location | API |
|----------|-----|
| `app/graphql/storefront/` | Storefront API (products, collections, cart) |
| `app/graphql/customer-account/` | Customer Account API (profile, orders) |
| `app/lib/fragments.ts` | Header/footer shared fragments |

Run `npm run codegen` after changing GraphQL documents.

---

## Content & ops docs (not app code)

| Path | Contents |
|------|----------|
| `docs/01-shopify-setup.md` | Store foundation |
| `docs/02-apps-installation.md` | Apps |
| `docs/03-theme-design.md` | Design reference (some outdated vs current Hydrogen UI) |
| `docs/05-product-template.md` | Product metafields template |
| `docs/08-catalog-launch.md` | Catalog launch checklist |
| `docs/09-languages.md` | i18n notes |
| `docs/10-shopify-packages-and-customers.md` | Packages + customers |
| `content/` | Page markdown, email templates, rental agreement, QA checklists |

---

## Deployment workflow

1. Work in `campmania/` on branch `main`.
2. `npm run build` to verify.
3. **User expects `git push origin main` after updates** — Oxygen auto-deploys from GitHub.
4. Do **not** commit `.env` or secrets.
5. Do **not** run destructive git commands unless asked.

### PowerShell note

Use `;` instead of `&&` to chain commands on Windows.

---

## User preferences (from project history)

- **Commerce-first** — prioritize shop UX over marketing fluff.
- **Push after updates** to `main` unless told otherwise.
- **Minimal scope** — don't refactor unrelated code.
- **No announcement bar**, no large catalog page heroes.
- Package cards should be **vertical** (not horizontal rows).
- Product images should show **full product** (`contain`), not cropped/zoomed.
- Match existing naming (`cm-*`, `trailrent` folder, Campmania brand).

---

## Common tasks — where to go

| Task | Files |
|------|-------|
| Change nav links | `app/components/Header.tsx` |
| Edit homepage | `app/components/trailrent/HomeCommerce.tsx`, `routes/_index.tsx` |
| Package listing/cards | `PackageCatalog.tsx`, `trailrent.css` (`cm-kit-card--package`) |
| Gear listing/cards | `GearCatalog.tsx`, `trailrent.css` |
| Filters | `CatalogFilters.tsx`, `trailrent.css` (`cm-filter-*`) |
| PDP / booking form | `products.$handle.tsx`, `RentalProductForm.tsx` |
| Add translation | `lib/trailrent/i18n.ts` |
| Shopify collection mapping | `lib/trailrent/shopify-catalog.ts` |
| Demo/fallback products | `lib/trailrent/catalog.ts` |
| Colors / spacing / cards | `app/styles/trailrent.css` |
| New route | `app/routes/` (file-based routing) |

---

## Known limitations / future work

- Demo catalog data shows when Shopify collections are empty.
- Customer login requires Oxygen URL (not localhost).
- Rent-to-own and full Booqable/Rentle integration documented in `docs/` but rental availability may be simplified in storefront.
- `docs/03-theme-design.md` describes Liquid theme sections — **this project is headless Hydrogen**, not a Shopify theme.

---

## Quick mental model

```
Shopify Admin (products, collections, metafields, customers)
        ↓ Storefront API
Hydrogen app (campmania/app/)
        ↓ React components + trailrent.css
Oxygen CDN → customer browser
```

When in doubt: **check the route loader → trace to `shopify-catalog.ts` or `catalog.ts` → find the `trailrent/` component → style in `trailrent.css`.**
