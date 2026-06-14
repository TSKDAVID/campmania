# TrailRent — Hiking Gear Rental (Georgia)

Premium outdoor gear rental for Tbilisi, Georgia. **Shopify Hydrogen** headless storefront + business docs and content.

## Quick start

```bash
cd campmania
npm install
npx shopify hydrogen env pull   # first time only — pulls Storefront API tokens
npm run dev
```

Open http://localhost:3000 (or the network URL shown in the terminal if port 3000 is busy).

## Customer login (Shopify)

Sign in uses **Shopify Customer Account API** (OAuth), not a custom password form.

1. Run `npx shopify hydrogen env pull` so `.env` has `PUBLIC_CUSTOMER_ACCOUNT_API_*` vars.
2. In **Shopify Admin → Settings → Customer accounts**, enable customer accounts and add this callback for local dev:
   - `http://localhost:3000/account/authorize`
3. Click **Sign in** in the header → `/account/login` → redirects to Shopify → back to `/account`.
4. **Loyalty (Trail Tested VIP):** assign customer tag `tier:trail-tested` in **Admin → Customers**; the account dashboard reads tags via the Customer Account API.

If localhost fails to load, use `npm run dev -- --host` and open the URL Vite prints (often `http://127.0.0.1:3000`).

## Connect to Shopify

Store is linked via Shopify CLI (`.shopify/project.json`). If env vars are missing:

```bash
npx shopify hydrogen link      # pick your store + Hydrogen storefront
npx shopify hydrogen env pull  # writes .env (never commit this file)
npm run dev
```

## Project layout

| Folder | Purpose |
|--------|---------|
| `app/` | Hydrogen storefront (TrailRent UI, booking, loyalty) |
| `content/` | Page copy, emails, rental agreement, checklists |
| `docs/` | Shopify Admin setup guides |
| `templates/` | Product CSV import, SEO metadata |

## Features

- **Trail packages** + **individual gear** catalogs with filters
- **Booking widget** — date range, metro station, price calc
- **Trusted Tier loyalty** — Explorer / Trail Tested (`tier:trail-tested` tag)
- **Metro hub pickup**, zero deposit, digital ID flow
- **Georgian (default) + English** language switcher

## Deploy

```bash
npx shopify hydrogen deploy
```

Push to GitHub: https://github.com/TSKDAVID/campmania
