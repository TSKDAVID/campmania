# Campmania Editorial Rebuild - Feature Parity Checklist

This checklist validates that the editorial rebuild preserves all Phase 1 logic/data contracts.

## Programmatic Parity Matrix

```json
{
  "routingContracts": {
    "status": "pass",
    "checks": [
      {"id": "R001", "target": "/", "preserved": true},
      {"id": "R002", "target": "/packages", "preserved": true},
      {"id": "R003", "target": "/individual-gear", "preserved": true},
      {"id": "R004", "target": "/collections/:handle", "preserved": true},
      {"id": "R005", "target": "/products/:handle", "preserved": true},
      {"id": "R006", "target": "/search", "preserved": true},
      {"id": "R007", "target": "/cart and /cart/:lines", "preserved": true},
      {"id": "R008", "target": "/discount/:code", "preserved": true},
      {"id": "R009", "target": "/gear-builder", "preserved": true}
    ]
  },
  "queryParamContracts": {
    "status": "pass",
    "checks": [
      {"id": "Q001", "target": "packages filters: trek/duration/difficulty", "preserved": true},
      {"id": "Q002", "target": "gear filters: gear", "preserved": true},
      {"id": "Q003", "target": "search: q/predictive", "preserved": true},
      {"id": "Q004", "target": "gear-builder: build/new", "preserved": true},
      {"id": "Q005", "target": "discount redirect params", "preserved": true}
    ]
  },
  "stateAndHooks": {
    "status": "pass",
    "checks": [
      {"id": "S001", "target": "LocaleProvider", "preserved": true},
      {"id": "S002", "target": "GearBuilderProvider", "preserved": true},
      {"id": "S003", "target": "Aside.Provider", "preserved": true},
      {"id": "S004", "target": "package filter state", "preserved": true},
      {"id": "S005", "target": "gear filter state", "preserved": true},
      {"id": "S006", "target": "rental booking state", "preserved": true},
      {"id": "S007", "target": "PDP fulfillment mode state", "preserved": true},
      {"id": "S008", "target": "cart local delivery state", "preserved": true}
    ]
  },
  "eventChains": {
    "status": "pass",
    "checks": [
      {"id": "E001", "target": "CartForm LinesAdd/Update/Remove", "preserved": true},
      {"id": "E002", "target": "filter toggle -> URL params", "preserved": true},
      {"id": "E003", "target": "cart drawer open/close", "preserved": true},
      {"id": "E004", "target": "rental date + day pricing recalculation", "preserved": true},
      {"id": "E005", "target": "gear builder save/load actions", "preserved": true}
    ]
  },
  "apiAndDataContracts": {
    "status": "pass",
    "checks": [
      {"id": "A001", "target": "HEADER_QUERY/FOOTER_QUERY", "preserved": true},
      {"id": "A002", "target": "CatalogProductsQuery storefront contract", "preserved": true},
      {"id": "A003", "target": "PRODUCT_QUERY route contract", "preserved": true},
      {"id": "A004", "target": "search GraphQL regular/predictive", "preserved": true},
      {"id": "A005", "target": "customer account queries/mutations", "preserved": true},
      {"id": "A006", "target": "cart line attribute keys for rental and packages", "preserved": true}
    ]
  },
  "priceAndCurrencyOutputs": {
    "status": "pass",
    "checks": [
      {"id": "P001", "target": "PriceWithCompare usage", "preserved": true},
      {"id": "P002", "target": "resolveCartDisplaySubtotal", "preserved": true},
      {"id": "P003", "target": "countRentalDays/calculateRentalTotal", "preserved": true},
      {"id": "P004", "target": "package duration recompute totals", "preserved": true}
    ]
  }
}
```

## Verification Notes

- Rebuild is presentation-first: business logic functions, loader/action signatures, route contracts, and GraphQL contracts remain in place.
- Core UI rewiring uses existing props/events in:
  - `app/components/trailrent/PackageCard.tsx`
  - `app/components/trailrent/CatalogProductCard.tsx`
  - `app/components/trailrent/CatalogFilters.tsx`
  - `app/components/RentalProductForm.tsx`
  - `app/components/CartMain.tsx`
  - `app/components/CartSummary.tsx`
- Global structure and tokenization were injected without replacing data pipelines:
  - `app/styles/editorial-tokens.ts`
  - `app/styles/editorial-overhaul.css`
  - `app/root.tsx`
