#!/usr/bin/env bash
# Register Didit webhook destination (run once per environment).
# Requires: DIDIT_API_KEY, PUBLIC_STOREFRONT_ORIGIN (Oxygen URL, HTTPS, not localhost)
#
# Example:
#   export DIDIT_API_KEY="your-rotated-key"
#   export PUBLIC_STOREFRONT_ORIGIN="https://campmania-4c29d91072afb5138da1.o2.myshopify.dev"
#   bash scripts/register-didit-webhook.sh
#
# Save secret_shared_key from the response as DIDIT_WEBHOOK_SECRET on Oxygen.

set -euo pipefail

if [[ -z "${DIDIT_API_KEY:-}" ]]; then
  echo "DIDIT_API_KEY is required" >&2
  exit 1
fi

ORIGIN="${PUBLIC_STOREFRONT_ORIGIN:-}"
if [[ -z "$ORIGIN" ]]; then
  echo "PUBLIC_STOREFRONT_ORIGIN is required (your Oxygen HTTPS URL)" >&2
  exit 1
fi

WEBHOOK_URL="${ORIGIN%/}/api/webhooks/didit"

echo "Registering Didit webhook → $WEBHOOK_URL"

curl -sS -X POST "https://verification.didit.me/v3/webhook/destinations/" \
  -H "x-api-key: ${DIDIT_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"label\": \"Campmania production session webhooks\",
    \"url\": \"${WEBHOOK_URL}\",
    \"webhook_version\": \"v3\",
    \"subscribed_events\": [\"status.updated\", \"data.updated\"]
  }" | python -m json.tool 2>/dev/null || cat

echo ""
echo "Copy secret_shared_key → DIDIT_WEBHOOK_SECRET in Oxygen env."
echo "Rotate DIDIT_API_KEY if it was ever exposed in chat or commits."
