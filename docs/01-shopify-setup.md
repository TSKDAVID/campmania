# Phase 1: Shopify Foundation Setup

Follow this checklist in Shopify Admin to configure your hiking gear rental store for Tbilisi, Georgia.

## 1. Create your store

1. Go to [shopify.com](https://www.shopify.com) and start a free trial
2. Store name: use `[Your Brand]` (changeable later)
3. Complete the setup wizard — skip adding products for now

## 2. Store details and locale

**Settings → Store details**

| Setting | Value |
|---------|-------|
| Store name | `[Your Brand]` |
| Store contact email | `[email@yourbrand.ge]` |
| Sender email | Same as above (verify domain later) |

**Settings → Markets**

1. Confirm **Georgia** is your primary market
2. Remove other markets if added by default (optional, keeps setup simple)

**Settings → Languages**

1. Primary language: **English**
2. Phase 2: Add Georgian via **Translate & Adapt** app

## 3. Currency

**Settings → Markets → Georgia → Products and pricing**

| Setting | Value |
|---------|-------|
| Currency | **GEL** (Georgian Lari) |
| Currency display | GEL or ₾ (your preference) |

If GEL is not available at signup, go to **Settings → Store details → Billing currency** and ensure storefront displays GEL via Markets.

## 4. Payment — Cash on Delivery

**Settings → Payments**

1. Under **Manual payment methods**, click **Add manual payment method**
2. Configure:

| Field | Value |
|-------|-------|
| Name | `Cash on Delivery` |
| Payment instructions | `Pay in cash when your gear is delivered. Please have the exact amount ready. A valid government-issued ID and signed rental agreement are required at delivery. We will email your rental agreement after booking — please read it before delivery day.` |
| Activate | Yes |

3. **Disable** Shopify Payments and third-party card gateways at launch unless you add a Georgian gateway later
4. Save

### Checkout additional settings

**Settings → Checkout**

| Setting | Recommendation |
|---------|----------------|
| Customer contact method | Email and phone |
| Customer information | Require phone number |
| Marketing | Optional opt-in |
| Tipping | Off |
| Order processing | Don't automatically fulfill (manual — you deliver) |

## 5. Shipping and delivery — Tbilisi only

**Settings → Shipping and delivery**

### Create shipping profile: "Rental Delivery"

1. **Settings → Shipping and delivery → Manage** (General shipping rates)
2. Create zone: **Tbilisi Local Delivery**

**Zone setup:**

| Field | Value |
|-------|-------|
| Zone name | `Tbilisi` |
| Countries/regions | Georgia |
| Rate name | `Door Delivery — Tbilisi` |
| Price | `5.00 GEL` |
| Delivery expectation | `1–2 business days` |

### Local delivery (Shopify native)

1. **Settings → Shipping and delivery → Local delivery**
2. Enable local delivery
3. Set delivery area: Tbilisi (use radius from your base address, or postcode list)
4. Minimum order: none
5. Delivery fee: **5 GEL** (if not already set in shipping profile)

### Return pickup

Return pickup is **not a shipping rate** — it is free and handled operationally.

Add this note to your Delivery page (copy in `content/pages/delivery.md`):
> Return pickup is always free. We schedule collection before your rental end date.

## 6. Taxes

**Settings → Taxes and duties**

1. Enable tax collection for Georgia if required by local law
2. Consult a Georgian accountant for VAT obligations on rental services
3. At minimum, document your tax registration status on your About page

## 7. Policies

**Settings → Policies**

Generate or paste from templates:

| Policy | Source |
|--------|--------|
| Privacy policy | Shopify generator + customize |
| Terms of service | Shopify generator + customize |
| Refund policy | See `content/pages/refund-policy.md` |
| Shipping policy | Use `content/pages/delivery.md` as basis |

Link all policies in footer navigation.

## 8. Checkout customization

**Settings → Checkout → Customize**

Add to order summary / thank you page area (via Checkout Extensibility or app):

**Required checkout checkbox** (add via Checkout Blocks app or custom checkout):

```
☐ I agree to the Rental Agreement and understand that a valid government-issued ID 
  and signed agreement are required at delivery. I have read or will read the 
  agreement sent to my email before delivery day.
```

Link "Rental Agreement" to `/pages/rental-agreement`.

## 9. Order confirmation email

**Settings → Notifications → Order confirmation**

Add after the order details block (see full template in `content/emails/order-confirmation.md`):

- Rental dates (from rental app order attributes)
- Delivery address
- Amount due in cash at delivery
- Link to rental agreement
- Reminder to bring valid ID

## 10. Domain

1. **Settings → Domains**
2. Purchase `[yourbrand].ge` or `.com` when brand name is finalized
3. Connect and set as primary

## 11. Navigation (initial)

**Online Store → Navigation**

### Main menu

```
Rent Gear (dropdown)
  → All Gear          /collections/all
  → Tents & Shelters  /collections/tents-shelters
  → Backpacks         /collections/backpacks
  → Sleeping Systems  /collections/sleeping-systems
  → Cooking & Water   /collections/cooking-water
  → Navigation & Safety /collections/navigation-safety
  → Bundles           /collections/bundles
How It Works          /pages/how-it-works
Delivery              /pages/delivery
FAQ                   /pages/faq
About                 /pages/about
```

### Footer menu

```
All Gear, Bundles, How It Works, Delivery, FAQ, About, Contact,
Rental Agreement, Privacy Policy, Terms of Service, Refund Policy
```

## 12. Verification checklist

Before moving to Phase 2, confirm:

- [ ] Store currency is GEL
- [ ] Cash on Delivery is the only active payment method
- [ ] Tbilisi delivery zone exists at 5 GEL
- [ ] Phone number required at checkout
- [ ] Policies created and linked
- [ ] Order confirmation email updated with rental agreement link
- [ ] Navigation menus created

## Next step

Continue to [`02-apps-installation.md`](02-apps-installation.md).
