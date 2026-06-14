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

### 2. Register callback URLs (required)

Shopify blocks `localhost` for login — use your **Oxygen preview URL** or a tunnel for local testing.

**Option A — CLI (fastest for Oxygen):**

```bash
npx shopify hydrogen customer-account-push \
  --dev-origin "https://campmania-4c29d91072afb5138da1.o2.myshopify.dev" \
  --storefront-id "gid://shopify/HydrogenStorefront/1000148205"
```

Re-run with your new Oxygen URL after each deploy if the subdomain changes.

**Option B — Shopify Admin manually:**

**Sales channels → Headless → campmania → Storefront settings → Customer Account API → Application setup**

Add:

| Field | Value |
|-------|--------|
| Callback URI | `https://campmania-4c29d91072afb5138da1.o2.myshopify.dev/account/authorize` |
| JavaScript origin | `https://campmania-4c29d91072afb5138da1.o2.myshopify.dev` |
| Logout URI | `https://campmania-4c29d91072afb5138da1.o2.myshopify.dev` |

Ensure the app type is **Public client** (required for JavaScript origins).

**Local dev:** Shopify does not allow `localhost` callbacks. Use the Oxygen preview URL for login testing, or run `npm run dev -- --customer-account-push` (Shopify CLI tunnel).

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
