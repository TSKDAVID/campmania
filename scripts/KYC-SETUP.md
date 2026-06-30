# Didit KYC & rental security — ops setup

## Where each secret comes from

| Variable | Where to get it | Who sets it |
|----------|-----------------|-------------|
| `DIDIT_API_KEY` | [Didit Business Console](https://business.didit.me) → **API** / **Developers** → create or copy API key | You (rotate after testing) |
| `DIDIT_WEBHOOK_SECRET` | Returned when you register the webhook (step 4 below). Field name: `secret_shared_key` | Auto from Didit API |
| `PUBLIC_STOREFRONT_ORIGIN` | Your Oxygen production URL: `https://campmania-4c29d91072afb5138da1.o2.myshopify.dev` | Fixed for this project |
| `SHOPIFY_ADMIN_API_ACCESS_TOKEN` | Shopify Admin **custom app** (step 2 below). Starts with `shpat_` | You — one-time install |
| `CHECKOUT_EXTENSION_SECRET` | Optional — only if you use Plus checkout blocks | Skip on Advanced plan |

**Not the same token:** `PRIVATE_STOREFRONT_API_TOKEN` in `.env` is your **Headless/Storefront** channel token (`unauthenticated_*` scopes). KYC webhooks need a separate **Admin** token with `read_customers` + `write_customers`.

---

## 1. Rotate secrets

If `DIDIT_API_KEY` was ever pasted in chat or committed, rotate it in [Didit console](https://business.didit.me) before production use.

## 2. Shopify Admin API token (required for `kyc:verified` tags)

1. Open **https://admin.shopify.com/store/b6dvzp-py/settings/apps/development**
2. If prompted, click **Allow custom app development**
3. **Create an app** → name it e.g. `Campmania KYC`
4. **Configuration** → **Admin API integration** → **Configure**
5. Enable scopes:
   - `read_customers`
   - `write_customers`
6. **Save** → **Install app** → confirm install
7. **API credentials** → **Admin API access token** → **Reveal token once**
8. Copy the token (`shpat_…`) into `.env`:

   ```env
   SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_your_token_here
   ```

9. Push to Oxygen (step 3) or paste the same value in **Hydrogen → Production → Environment variables**

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

Expect:

```json
{
  "diditConfigured": true,
  "webhookConfigured": true,
  "adminConfigured": true,
  "storefrontOriginConfigured": true
}
```

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
