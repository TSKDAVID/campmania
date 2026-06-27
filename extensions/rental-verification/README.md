# Campmania Rental — Checkout UI Extensions

Two checkout block extensions for Didit KYC and rental security deposit choice.

| Extension | Handle | Default placement |
|-----------|--------|-------------------|
| Rental verification banner | `rental-verification-banner` | `INFORMATION1` |
| Rental verification payment | `rental-verification` | `PAYMENT1` |

## Setup

1. Link the app: `shopify app config link` (populates `client_id` in `shopify.app.toml`).
2. Install deps:
   ```bash
   cd extensions/rental-verification && npm install && cd ../..
   cd extensions/rental-verification-banner && npm install && cd ../..
   ```
3. Deploy: `shopify app deploy`
4. In **Settings → Checkout → Customize**, click **Add app block** and add both **Didit** blocks:
   - **Rental verification banner** (Information step)
   - **Rental verification payment** (Payment step)
5. Configure extension settings on each block:
   - **Storefront API origin** — your Oxygen HTTPS URL
   - **Checkout extension secret** — same value as `CHECKOUT_EXTENSION_SECRET` on Oxygen

## Oxygen env (storefront)

See `.env.example` for `DIDIT_*`, `SHOPIFY_ADMIN_API_ACCESS_TOKEN`, and `CHECKOUT_EXTENSION_SECRET`.

## Didit webhook

```bash
export DIDIT_API_KEY="..."
export PUBLIC_STOREFRONT_ORIGIN="https://your-oxygen-url.o2.myshopify.dev"
bash scripts/register-didit-webhook.sh
```

Rotate any API key that was exposed in chat or commits.
