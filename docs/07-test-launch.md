# Phase 5: Test Bookings and Launch

Run 5 end-to-end test bookings before public launch. Use this guide and record results in `content/checklists/launch-qa.md`.

---

## Pre-test setup

Before running test orders:

1. Store is in **development mode** or password-protected
2. All apps installed and configured (Booqable, Zapiet, Judge.me)
3. At least 5 products live with availability
4. COD payment enabled
5. Order confirmation email updated with agreement link
6. Staff checklists printed (`content/checklists/staff-delivery-return.md`)

---

## Test scenarios

Run all 5 scenarios. Use real Tbilisi addresses (your own or team members').

### Test 1: Single item, 3-day rental

| Step | Action | Expected result | Pass? |
|------|--------|-----------------|-------|
| 1 | Open a tent product page | Date picker visible, price in GEL | |
| 2 | Select 3-day date range | Price updates to daily × 3 | |
| 3 | Add to cart | Cart shows item, dates, rental subtotal | |
| 4 | Proceed to checkout | 5 GEL delivery added, total correct | |
| 5 | Enter Tbilisi address | Address accepted in delivery zone | |
| 6 | Select delivery date/time | Zapiet picker works | |
| 7 | Select COD payment | Only COD option shown | |
| 8 | Place order | Order confirmation page shown | |
| 9 | Check email | Confirmation received with agreement link | |
| 10 | Mock delivery | Fill staff checklist, mark fulfilled | |
| 11 | Mock return | Fill return checklist, add tags | |

### Test 2: Bundle, 7-day (weekly rate)

| Step | Action | Expected result | Pass? |
|------|--------|-----------------|-------|
| 1 | Open Weekend Hiker Kit bundle | Bundle page loads with all included items | |
| 2 | Select 7-day range | Weekly rate applied (not daily × 7) | |
| 3 | Complete checkout | Total = weekly rate + 5 GEL | |
| 4 | Verify email | Agreement link works, dates correct | |

### Test 3: Two items in one order

| Step | Action | Expected result | Pass? |
|------|--------|-----------------|-------|
| 1 | Add backpack (3 days) to cart | Cart shows item 1 with dates | |
| 2 | Add sleeping bag (3 days) to cart | Cart shows both items, same dates | |
| 3 | Checkout | Combined total correct | |
| 4 | Staff checklist | Both items listed for delivery/return | |

### Test 4: Unavailable dates

| Step | Action | Expected result | Pass? |
|------|--------|-----------------|-------|
| 1 | Block dates in Booqable for one item | Dates show unavailable in picker | |
| 2 | Try to select blocked dates | Cannot add to cart / error shown | |
| 3 | Select available dates instead | Proceeds normally | |

### Test 5: Mobile checkout (phone)

| Step | Action | Expected result | Pass? |
|------|--------|-----------------|-------|
| 1 | Open site on iPhone/Android | Layout correct, no horizontal scroll | |
| 2 | Select dates on product page | Date picker usable on touch | |
| 3 | Complete full checkout on mobile | All steps work without zooming | |
| 4 | Sticky CTA visible | "Check availability" bar at bottom | |

---

## Issue log

Record any failures during testing:

| Test # | Step | Issue | Fix applied | Retest pass? |
|--------|------|-------|-------------|--------------|
| | | | | |
| | | | | |
| | | | | |

---

## Soft launch

After all 5 tests pass:

1. Share store URL with 3–5 friends/family in Tbilisi
2. Ask them to:
   - Browse on mobile
   - Complete one test booking (comp with promo code `BETA100` for 100% off if needed)
   - Provide feedback on trust, clarity, and ease
3. Collect at least 3 real reviews via Judge.me
4. Fix any reported issues

### Beta discount code (optional)

| Field | Value |
|-------|-------|
| Code | `BETA100` |
| Type | 100% off |
| Usage | Limit to 5 uses |
| Purpose | Free test rentals for beta testers |

---

## Go live checklist

- [ ] All 5 test scenarios passed
- [ ] Issues logged and fixed
- [ ] Beta feedback incorporated
- [ ] 3+ reviews visible on site
- [ ] All `[Your Brand]` placeholders replaced
- [ ] Domain connected (or decision to launch on myshopify.com)
- [ ] Password protection removed
- [ ] Google Search Console sitemap submitted
- [ ] Team briefed on delivery/return process and staff checklists
- [ ] First 3 real orders will be monitored personally

**Launch date:** _______________

---

## Post-launch monitoring (first 2 weeks)

| Metric | Target | Week 1 actual | Week 2 actual |
|--------|--------|---------------|---------------|
| Orders | 3+ | | |
| Conversion rate | 2–4% | | |
| Cart abandonment | <70% | | |
| Avg. order value (GEL) | Track | | |
| Reviews collected | 30%+ of renters | | |
| Support response time | <2 hours | | |

Review Shopify Analytics weekly. Adjust pricing, delivery hours, and catalog based on data.
