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

Sign in uses **Shopify Customer Account API** (OAuth). The error `redirect_uri mismatch` means your store is missing the callback URL for where you're browsing.

### 1. Enable customer accounts

**Shopify Admin → Settings → Customer accounts** — turn on customer accounts (new customer accounts recommended).

### 2. Add callback URLs (required)

**Shopify Admin → Sales channels → Headless** → your Hydrogen storefront → **Customer Account API** → **Application setup** → **Callback URL(s)**.

Add **every** URL you use:

| Environment | Callback URL |
|-------------|--------------|
| Local dev | `http://localhost:3000/account/authorize` |
| Oxygen preview | `https://YOUR-STORE.o2.myshopify.dev/account/authorize` |

Your current Oxygen URL (from the browser address bar when deployed):

`https://campmania-4c29d91072afb5138da1.o2.myshopify.dev/account/authorize`

If you redeploy and the `.o2.myshopify.dev` subdomain changes, add the new URL too.

### 3. Pull env vars

```bash
npx shopify hydrogen env pull
npm run dev
```

### 4. Test

Header **Sign in** → Shopify login → back to `/account`. For **Trail Tested VIP**, add customer tag `tier:trail-tested` in **Admin → Customers**.

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
