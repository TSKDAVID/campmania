# Shopify packages, catalog & customer accounts

This guide explains how to connect Campmania’s **Packages** and **Individual gear** pages to real Shopify products, set bundle pricing, and enable **customer** login (including Google/social).

## What the storefront reads

| Page | Shopify collection handle | Route |
|------|---------------------------|-------|
| Trail packages | `trail-packages` | `/packages` |
| Individual gear | `individual-gear` | `/individual-gear` |

If a collection is empty or missing, the site shows **demo data** with a yellow setup hint.

Each product card links to `/products/{handle}` where shoppers book via the rental form and checkout.

---

## 1. Create collections

1. **Shopify Admin → Products → Collections → Create collection**
2. Create two **manual** collections:
   - Handle: `trail-packages` — title e.g. “Trail packages”
   - Handle: `individual-gear` — title e.g. “Individual gear”
3. Add the relevant products to each collection.

---

## 2. Create package products (combo kits)

Each package is **one Shopify product** in the `trail-packages` collection. **Included gear** comes from a **linked kit collection** (not a hand-written metafield list).

### Kit contents collection (recommended)

1. Create a manual collection per package, handle: **`{package-product-handle}-includes`**  
   Example: product `tobavarchkhili` → collection `tobavarchkhili-includes`
2. Add the **individual gear products** that belong in that kit (tent, backpack, sleeping bag, etc.).
3. Optional but recommended: set product metafield **`custom.included_collection`** → that collection (`collection_reference`, Storefront access).

The storefront reads products from that collection for:
- Small item thumbnails under package cards on `/packages`
- “What’s included” on the package product page
- Bundle pricing (sum of item daily rates × 30% package discount)

Legacy fallbacks (if no kit collection exists): `custom.included_product_handles` or `custom.included_items`.

### Pricing & discount

- **Price** = daily rental rate (what the customer pays per day)
- **Compare at price** = sum of individual items (shows “Was” price and savings %)

Example: tent (₾30) + backpack (₾20) + bag (₾15) = **Compare at ₾65**, set **Price ₾55** → site shows **-15%** savings.

### Tags (for filters on `/packages`)

| Tag prefix | Example | Filter |
|------------|---------|--------|
| `trek-` | `trek-tobavarchkhili`, `trek-birtvisi`, `trek-kazbegi` | Trail |
| `duration-` | `duration-1-day`, `duration-2-day`, `duration-weekend` | Duration |
| `difficulty-` | `difficulty-easy`, `difficulty-moderate`, `difficulty-hard` | Difficulty |

### Metafields

Create product metafields under **Settings → Custom data → Products**:

| Namespace & key | Type | Purpose |
|-----------------|------|---------|
| `custom.included_collection` | Collection reference | **Kit contents** — products in this collection are included items |
| `custom.kit_summary` | Single line text | Short subtitle (optional; falls back to description) |
| `custom.included_items` | Multi-line text or JSON list | Legacy text list (fallback only) |
| `custom.included_product_handles` | Single line text / JSON | Legacy handle list (fallback only) |

**Kit collection** example:

- Package product handle: `birtvisi-package`
- Kit collection handle: `birtvisi-package-includes`
- Products inside kit collection: tent, backpack, sleeping bag (from `individual-gear`)

**included_items** (legacy) examples:

```
2-person tent
20L backpack
Sleeping bag (-5°C)
```

Or JSON: `["2-person tent","20L backpack","Sleeping bag (-5°C)"]`

Enable **Storefront API access** for both metafield definitions.

---

## 3. Create individual gear products

Same flow, but add to `individual-gear` collection.

**Important:** A product only appears on `/individual-gear` if it is in the **`individual-gear` collection** in Shopify Admin (Products → Collections). Creating a product alone is not enough.

### Tags (for filters on `/individual-gear`)

| Tag prefix | Example |
|------------|---------|
| `gear-` | `gear-tent`, `gear-backpack`, `gear-sleeping`, `gear-poles`, `gear-shoes`, `gear-cooking`, `gear-clothing` |

---

## 4. Cart & checkout

- **Add to cart** on product pages uses Shopify Cart API with rental dates as line attributes.
- **Checkout** button in the cart goes to Shopify Checkout (`cart.checkoutUrl`).
- Configure payment, shipping, and policies in Shopify Admin as usual.

---

## 5. Customer accounts (not staff login)

Campmania uses the **Customer Account API** — this is for **shoppers**, not store owners.

### Enable customer accounts

1. **Settings → Customer accounts**
2. Choose **Customer accounts** (new experience recommended)
3. Under **Login methods**, enable:
   - Email + password (sign up / sign in)
   - **Google**, **Facebook**, **Apple**, etc. as desired

Social providers are configured entirely in Shopify Admin; no theme code changes required.

### OAuth redirect URIs (Hydrogen / Oxygen)

After changing domains, run:

```bash
npm run auth:push
```

For local login testing with a tunnel:

```bash
npm run dev:auth
```

**Note:** Plain `localhost` login is blocked by Shopify — use your Oxygen URL or `dev:auth`.

### Loyalty tier

Add customer tag `tier:trail-tested` in **Admin → Customers** to unlock Trusted Tier benefits on the account page.

---

## 6. Didit KYC & rental security at checkout

Rental checkout requires **identity verification** or a **security deposit** (customer choice on Shopify checkout).

### Product metafield — deposit amount

Run `scripts/setup-rental-kyc-metafields.graphql` via Admin GraphQL, then set per product:

| Namespace & key | Type | Purpose |
|-----------------|------|---------|
| `custom.deposit_amount` | Number (decimal) | Security deposit in GEL when customer skips KYC |

Enable **Storefront API** read access. The storefront copies this to cart line attribute `deposit_amount`; multiple items sum at checkout.

### Customer tags (applied by Didit webhook)

| Tag | Meaning |
|-----|---------|
| `kyc:verified` | Didit approved — no deposit path |
| `kyc:declined` | Verification declined — rental checkout blocked |
| `kyc:in_review` | Manual review — blocked until resolved |
| `rental:blocked` | Staff ban (e.g. damaged gear) |

### Oxygen environment variables

```bash
DIDIT_API_KEY=              # rotate if exposed; server-only
DIDIT_WEBHOOK_SECRET=       # from Didit webhook registration
SHOPIFY_ADMIN_API_ACCESS_TOKEN=  # custom app: read/write customers
CHECKOUT_EXTENSION_SECRET=  # shared with checkout UI extension settings
PUBLIC_STOREFRONT_ORIGIN=   # Oxygen HTTPS URL for webhooks
```

### One-time setup

1. **Custom app** in Admin → scopes `read_customers`, `write_customers`
2. **Register Didit webhook**: `bash scripts/register-didit-webhook.sh`
3. **Deploy storefront**: `shopify hydrogen deploy`
4. **Deploy checkout extension**: `shopify app config link` then `shopify app deploy`
5. **Checkout customize**: pin **Rental verification** extension (header + before payment)

See `extensions/rental-verification/README.md` for extension settings.

**Phase 2:** card authorization hold for deposit path (UI and order attributes are ready now).

---

## 7. Quick checklist

- [ ] Collection `trail-packages` with kit products
- [ ] Collection `individual-gear` with rental items
- [ ] Tags on each product for filters
- [ ] Metafields `custom.included_items` (+ optional `custom.kit_summary`) with Storefront access
- [ ] Compare at price set on package variants for bundle savings display
- [ ] Customer accounts enabled with email + social login
- [ ] `npm run auth:push` after domain changes
- [ ] `custom.deposit_amount` on rental products
- [ ] Didit + Admin API env vars on Oxygen
- [ ] Checkout extension deployed and pinned in checkout editor
