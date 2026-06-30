# Didit KYC & rental security — ops setup

## Where each secret comes from

| Variable | Where to get it | Who sets it |
|----------|-----------------|-------------|
| `DIDIT_API_KEY` | [Didit Business Console](https://business.didit.me) → **API** / **Developers** → create or copy API key | You (rotate after testing) |
| `DIDIT_WEBHOOK_SECRET` | Returned when you register the webhook (step 4 below). Field name: `secret_shared_key` | Auto from Didit API |
| `PUBLIC_STOREFRONT_ORIGIN` | Your Oxygen production URL: `https://campmania-4c29d91072afb5138da1.o2.myshopify.dev` | Fixed for this project |
| `SHOPIFY_ADMIN_API_ACCESS_TOKEN` | Legacy custom apps only (`shpat_…`) — **no longer shown in UI for new apps** | Optional |
| `SHOPIFY_CLIENT_ID` | Dev Dashboard → your app → **Settings** → Client ID | You |
| `SHOPIFY_CLIENT_SECRET` | Dev Dashboard → your app → **Settings** → Secret | You |
| `CHECKOUT_EXTENSION_SECRET` | Optional — only if you use Plus checkout blocks | Skip on Advanced plan |

**Not the same token:** `PRIVATE_STOREFRONT_API_TOKEN` in `.env` is your **Headless/Storefront** channel token. KYC customer tagging uses **Dev Dashboard Client ID + Secret** (or legacy `shpat_`).

---

## 1. Rotate secrets

If `DIDIT_API_KEY` was ever pasted in chat or committed, rotate it in [Didit console](https://business.didit.me) before production use.

## 2. Shopify Admin API (Dev Dashboard app — Campmania_KYC)

Shopify **removed** the old “API credentials → Reveal token once” screen. For apps created in **dev.shopify.com**, you use **Client ID + Secret** from **Settings** — there is no separate “API credentials” tab.

### 2a. Add Admin API scopes to your app

1. Open **https://dev.shopify.com** → **Campmania_KYC**
2. Click **Versions** → **New version** (or edit the active version)
3. Under **Admin API access scopes**, enable at minimum:
   - `read_customers`
   - `write_customers`
4. **Release** the version
5. Ensure the app is **installed** on `b6dvzp-py.myshopify.com` (Overview shows “1 install”)

### 2b. Copy credentials from Settings

1. **Campmania_KYC** → **Settings** (the tab you already have)
2. Copy **Client ID** and **Secret** (click eye icon to reveal Secret)
3. Add to `.env`:

   ```env
   SHOPIFY_CLIENT_ID=d77bfca59ae98df78eaf38f896196a8b
   SHOPIFY_CLIENT_SECRET=your_secret_from_settings
   ```

   Oxygen exchanges these for a short-lived Admin API token automatically (no `shpat_` to copy).

4. Push to Oxygen (step 3) and **redeploy**

**Do not** put the Secret in `SHOPIFY_ADMIN_API_ACCESS_TOKEN`. That field is only for legacy static `shpat_` tokens if you still have one.

## 3. Push environment to Oxygen

From project root (interactive — confirm when prompted):

```bash
npx shopify hydrogen env push --env production
```

Or push only KYC vars:

```bash
npx shopify hydrogen env push --env production --env-file .env.kyc
```

**Verify** (no secrets in response):

```
https://campmania-4c29d91072afb5138da1.o2.myshopify.dev/api/kyc/health
```

Expect all four flags `true` after **redeploy** (step 3b below).

### 3b. Redeploy after changing env vars (required)

Oxygen deployments are **immutable** — pushing env vars updates the environment config, but the **live site keeps the old values** until you redeploy.

**Option A — GitHub (automatic):** push any commit to `main` (triggers `.github/workflows/oxygen-deployment-*.yml`).

**Option B — Shopify Admin:** Hydrogen storefront → **Production** → ⋮ → **Redeploy environment**.

**Option C — CLI:**

```bash
npx shopify hydrogen deploy --env production
```

Until you redeploy, `/api/kyc/health` may show all `false` even after a successful `env push`.

## 4. Register Didit webhook (already done if you used the script)

```bash
export DIDIT_API_KEY="your-key"
export PUBLIC_STOREFRONT_ORIGIN="https://campmania-4c29d91072afb5138da1.o2.myshopify.dev"
bash scripts/register-didit-webhook.sh
```

Copy `secret_shared_key` from the JSON response → `DIDIT_WEBHOOK_SECRET` in `.env` / Oxygen.

Webhook URL registered:

```
https://campmania-4c29d91072afb5138da1.o2.myshopify.dev/api/webhooks/didit
```

## 5. Shopify Admin (product data)

1. Run metafield definitions:
   ```bash
   shopify graphql admin --query scripts/setup-rental-kyc-metafields.graphql
   ```
2. Set `custom.deposit_amount` (GEL) on each rental product.

## 6. Checkout UI extension (Plus only — skip on Advanced)

```bash
shopify app config link
cd extensions/rental-verification && npm install && cd ../..
shopify app deploy
```

On **Advanced**, use the **storefront cart** KYC panel instead (no checkout blocks).

## Customer tags

| Tag | Set by |
|-----|--------|
| `kyc:verified` | Didit webhook `Approved` |
| `kyc:declined` | Didit webhook `Declined` |
| `kyc:in_review` | Didit webhook `In Review` |
| `rental:blocked` | Staff manually in Admin |
