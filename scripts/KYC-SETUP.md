# Didit KYC & rental security — ops setup

## 1. Rotate secrets

If `DIDIT_API_KEY` was ever pasted in chat or committed, rotate it in [Didit console](https://business.didit.me) before production use.

## 2. Shopify Admin

1. Run metafield definitions:
   ```bash
   shopify graphql admin --query scripts/setup-rental-kyc-metafields.graphql
   ```
2. Set `custom.deposit_amount` (GEL) on each rental product.
3. Create a **custom app** with `read_customers` + `write_customers` → copy Admin API token.

## 3. Oxygen environment

Set on the Hydrogen storefront (never commit):

| Variable | Purpose |
|----------|---------|
| `DIDIT_API_KEY` | Didit session API |
| `DIDIT_WEBHOOK_SECRET` | Webhook HMAC (from step 4) |
| `SHOPIFY_ADMIN_API_ACCESS_TOKEN` | Tag customers on webhook |
| `CHECKOUT_EXTENSION_SECRET` | Checkout extension → Oxygen API auth |
| `PUBLIC_STOREFRONT_ORIGIN` | `https://…o2.myshopify.dev` |

## 4. Register Didit webhook

After deploying the storefront to Oxygen:

```bash
export DIDIT_API_KEY="your-rotated-key"
export PUBLIC_STOREFRONT_ORIGIN="https://campmania-4c29d91072afb5138da1.o2.myshopify.dev"
bash scripts/register-didit-webhook.sh
```

Save `secret_shared_key` → `DIDIT_WEBHOOK_SECRET`.

## 5. Checkout UI extension

```bash
shopify app config link
cd extensions/rental-verification && npm install && cd ../..
shopify app deploy
```

In **Settings → Checkout → Customize**, click **Add app block** and add **Rental verification**:

- Banner block → place at top of Information step (`INFORMATION1`)
- Payment block → place at top of Payment step (`PAYMENT1`)

Extension settings must match Oxygen: storefront origin + `CHECKOUT_EXTENSION_SECRET`.

## Customer tags

| Tag | Set by |
|-----|--------|
| `kyc:verified` | Didit webhook `Approved` |
| `kyc:declined` | Didit webhook `Declined` |
| `kyc:in_review` | Didit webhook `In Review` |
| `rental:blocked` | Staff manually in Admin |
