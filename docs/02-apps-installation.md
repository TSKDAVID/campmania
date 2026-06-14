# Phase 2: App Installation and Configuration

Install and configure these Shopify apps for date-based rental, Tbilisi delivery, reviews, and email automation.

## App stack overview

| App | Purpose | Priority | Est. cost |
|-----|---------|----------|-----------|
| Booqable or Rentle | Rental dates, availability, pricing | Critical | ~$29–49/mo |
| Zapiet Delivery & Pickup | Delivery date/time slots, Tbilisi zones | Critical | ~$14–29/mo |
| Judge.me | Photo reviews, star ratings | High | Free tier available |
| Shopify Email or Klaviyo | Automated emails, contract link | High | Free–$20/mo |
| Shopify Inbox | Live chat, WhatsApp link | High | Free |

---

## 1. Rental app — Booqable (recommended)

**Install:** Shopify App Store → search "Booqable"

### Initial setup

1. Connect Booqable to your Shopify store
2. Set timezone: **Asia/Tbilisi (UTC+4)**
3. Set currency: **GEL**

### Pricing configuration

Create pricing structures:

| Structure | Use for |
|-----------|---------|
| Daily rate | All individual items |
| Weekly rate | 7-day rentals (discounted) |
| Weekend rate (optional) | Fri–Sun flat rate |

Example for a backpack:
- Daily: 25 GEL
- Weekly: 60 GEL (save ~15%)

### Availability rules

| Rule | Value |
|------|-------|
| Minimum rental period | 1 day (adjust as needed) |
| Buffer between rentals | 1 day (cleaning/inspection) |
| Advance booking limit | 90 days |
| Same-day booking | Off (unless you can fulfill same day) |

### Product sync

1. Create products in Booqable first OR sync from Shopify
2. Enable Booqable widget on product pages (see `docs/03-theme-design.md`)
3. Map each Shopify product to a Booqable rental item

### Deposit (optional at launch)

If collecting deposits:
- Configure security deposit in Booqable
- Note: with COD, deposits are typically collected in cash at delivery
- Document amount in product metafield `rental.deposit_amount`

### Alternative: Rentle

If Booqable doesn't fit, use Rentle with the same configuration:
- Date picker on product page
- Daily/weekly pricing in GEL
- Availability calendar per item

---

## 2. Delivery app — Zapiet

**Install:** Shopify App Store → "Zapiet - Pickup + Delivery"

### Configure delivery

1. Enable **Delivery** (disable pickup unless you offer it later)
2. Set service area: **Tbilisi**

**Delivery zones:**

| Zone | Coverage | Fee |
|------|----------|-----|
| Tbilisi Central | All Tbilisi districts | 5 GEL |

Districts to include: Vake, Saburtalo, Isani, Gldani, Nadzaladevi, Didube, Chughureti, Mtatsminda, Krtsanisi, Samgori.

3. **Delivery schedule:**
   - Days: Tuesday–Saturday (adjust to your ops)
   - Hours: 10:00–18:00
   - Cut-off: 14:00 for next-day delivery
   - Max orders per slot: 5 (adjust based on capacity)

4. **Checkout widget:** Enable date and time slot picker at checkout

### Return pickup

Zapiet handles delivery only. Return pickup is operational:

1. Add order tag `return-scheduled` when pickup is booked
2. Use Shopify Flow or manual process to schedule return day before rental end
3. Staff uses `content/checklists/staff-delivery-return.md`

### Alternative: Shopify Local Delivery (native)

If skipping Zapiet:
- Use **Settings → Shipping and delivery → Local delivery**
- Add delivery instructions field at checkout
- Manually confirm delivery date via email after order

---

## 3. Reviews — Judge.me

**Install:** Shopify App Store → "Judge.me Product Reviews"

### Configuration

| Setting | Value |
|---------|-------|
| Review request timing | 3 days after return |
| Photo reviews | Enabled |
| Star ratings on product cards | Enabled |
| Review form fields | Add custom field: "Trip type" (e.g. day hike, multi-day trek) |
| Minimum rating to display | 1 star (show all) |

### Seed reviews at launch

Before public launch, add 3–5 genuine reviews from beta testers:
1. Judge.me → Reviews → Import or manually add
2. Include photo where possible
3. Mention Tbilisi trails or local context

---

## 4. Email — Shopify Email (launch) or Klaviyo (scale)

### Shopify Email (recommended for launch)

**Install:** Free with Shopify

Create these campaigns/automations (templates in `content/emails/`):

| Automation | Trigger | Template file |
|------------|---------|---------------|
| Order confirmation (enhanced) | Order placed | `order-confirmation.md` |
| Delivery reminder | 1 day before delivery | `delivery-reminder.md` |
| Return reminder | 1 day before rental end | `return-reminder.md` |
| Review request | 3 days after return | `review-request.md` |

### Klaviyo (optional upgrade)

Use if you need:
- Conditional flows based on rental dates
- SMS reminders
- Advanced segmentation

---

## 5. Shopify Inbox

**Install:** Free with Shopify

### Configuration

1. Enable chat widget on all pages
2. Set availability hours: match delivery hours
3. Add quick replies:
   - "How does rental work?"
   - "What's included in delivery?"
   - "Do I need to bring ID?"
4. Add WhatsApp link in chat footer: `[+995 XXX XXX XXX]`

---

## 6. App integration checklist

After all apps are installed:

- [ ] Booqable/Rentle date picker appears on product pages
- [ ] Selecting dates updates price in GEL
- [ ] Zapiet delivery date picker appears at checkout
- [ ] 5 GEL delivery fee shows in cart/checkout
- [ ] COD is only payment option
- [ ] Judge.me stars show on product cards
- [ ] Order confirmation includes rental agreement link
- [ ] Inbox chat widget visible on mobile and desktop

## Next step

Continue to [`03-theme-design.md`](03-theme-design.md).
