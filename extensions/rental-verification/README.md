# Campmania Rental — Checkout UI Extension

Checkout extension for Didit KYC and rental security deposit choice.

## Setup

1. Link the app: `shopify app config link` (populates `client_id` in `shopify.app.toml`).
2. In **Settings → Checkout → Customize**, add the **Rental verification** extension:
   - Header placement (banner)
   - Before payment methods (KYC / deposit choice)
3. Configure extension settings:
   - **Storefront API origin** — your Oxygen HTTPS URL
   - **Checkout extension secret** — same value as `CHECKOUT_EXTENSION_SECRET` on Oxygen
4. Deploy: `shopify app deploy`

## Oxygen env (storefront)

See `.env.example` for `DIDIT_*`, `SHOPIFY_ADMIN_API_ACCESS_TOKEN`, and `CHECKOUT_EXTENSION_SECRET`.

## Didit webhook

```bash
export DIDIT_API_KEY="..."
export PUBLIC_STOREFRONT_ORIGIN="https://your-oxygen-url.o2.myshopify.dev"
bash scripts/register-didit-webhook.sh
```

Rotate any API key that was exposed in chat or commits.
