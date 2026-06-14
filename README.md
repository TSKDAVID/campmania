# TrailRent — Hiking Gear Rental (Georgia)

Premium outdoor gear rental for Tbilisi, Georgia. **Shopify Hydrogen** headless storefront + business docs and content.

## Stack

| Folder | Purpose |
|--------|---------|
| [`storefront/`](storefront/) | **TrailRent Hydrogen app** (TypeScript, React Router 7, Tailwind) — primary storefront |
| [`docs/`](docs/) | Shopify Admin setup guides |
| [`content/`](content/) | Page copy, emails, rental agreement, checklists |
| [`templates/`](templates/) | Product CSV import, SEO metadata |

## Quick start (storefront)

```bash
cd storefront
npm install
npm run dev
```

Open http://localhost:3000 — uses Mock.shop until you link your store:

```bash
npx shopify hydrogen link
npx shopify hydrogen env pull
```

## Features

- **Trail packages** + **individual gear** catalogs with filters
- **Booking widget** — date range, metro station, price calc (mock → cart attributes when linked)
- **Trusted Tier loyalty** — Explorer / Trail Tested (`tier:trail-tested` tag)
- **Metro hub pickup**, zero deposit, digital ID flow (copy + UX)
- **Georgian (default) + English** language switcher

## Business model

- **Service area:** Tbilisi, Georgia
- **Pickup/return:** Metro hub (not door delivery)
- **Deposit:** 0 GEL after digital ID verification
- **Loyalty:** Trusted Tier — clean returns unlock Trail Tested benefits

## Legacy

The Liquid OS 2.0 theme has been replaced by the Hydrogen storefront in `storefront/`. Content in `content/` and product CSVs remain for Shopify Admin setup.

## Replace before launch

- `[Your Brand]` — business name
- `[yourbrand]` — handle / domain
- Contact email, phone, delivery hours in storefront env / settings

## Deploy

```bash
cd storefront
npx shopify hydrogen deploy
```

Push to GitHub when ready — see [`storefront/README.md`](storefront/README.md).
