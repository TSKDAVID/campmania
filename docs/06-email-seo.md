# Email Automation and SEO Setup

## Email automation

### Shopify Email (launch)

**Install:** Apps → Shopify Email (free)

Create these automations (Settings → Notifications for order confirmation; Shopify Email for campaigns):

| # | Email | Trigger | Template | Status |
|---|-------|---------|----------|--------|
| 1 | Order confirmation (enhanced) | Order placed | `content/emails/order-confirmation.md` | Required |
| 2 | Delivery reminder | 1 day before delivery | `content/emails/delivery-reminder.md` | Required |
| 3 | Return reminder | 1 day before rental end | `content/emails/return-reminder.md` | Required |
| 4 | Review request | 3 days after return | `content/emails/review-request.md` | Required |
| 5 | Abandoned checkout | 1 hour after abandon | Shopify default + customize | Recommended |

### Klaviyo upgrade path (optional)

When order volume exceeds ~50/month, migrate to Klaviyo for:
- Date-triggered flows based on Booqable rental end dates
- SMS delivery reminders
- Segmentation (first-time vs. repeat renters)

**Key flows to replicate:**
1. Post-purchase → agreement link + delivery prep
2. Pre-delivery → reminder with cash amount
3. Pre-return → pickup scheduling
4. Post-return → review request + COMEBACK10 discount

### Discount code for retention

Create in **Discounts → Create discount**:

| Field | Value |
|-------|-------|
| Code | `COMEBACK10` |
| Type | Percentage |
| Value | 10% |
| Applies to | All rental products |
| Minimum requirement | None |
| Usage limit | 1 per customer |

Mention in return reminder and review request emails.

---

## SEO setup

### Global SEO (Online Store → Preferences)

| Field | Value |
|-------|-------|
| Homepage title | `[Your Brand] — Hiking Gear Rental Tbilisi \| Door Delivery` |
| Homepage meta description | `Rent premium hiking and camping gear in Tbilisi. Tents, backpacks, sleeping bags delivered to your door for 5 GEL. Free return pickup. Cash on delivery.` |
| Social sharing image | 1200×630px hero image with brand name |

### Page-level SEO

Apply titles and descriptions from `templates/seo-metadata.csv` to each page and collection in Shopify Admin → Search engine listing.

### Product SEO format

**Title:** `[Product Name] Rental Tbilisi | [Your Brand]`
**Description:** `Rent [product] in Tbilisi. [Price] GEL/day. Door delivery 5 GEL. Free return pickup. Cash on delivery.`

All product SEO values are in `templates/product-upload.csv`.

### Image alt text format

`[Product name] — [key feature] — rental Tbilisi [Your Brand]`

Example: `MSR Hubba Hubba 2-person tent — lightweight backpacking — rental Tbilisi [Your Brand]`

### Collection descriptions

Each collection needs 150+ words. Template:

```
Rent [category] in Tbilisi with [Your Brand]. We offer [list 2-3 product types] 
from trusted brands including [brands]. All gear is cleaned and inspected before 
every rental.

Door delivery across Tbilisi costs 5 GEL. Return pickup is always free. Pay cash 
on delivery — no online payment required. A rental agreement is emailed after 
booking, and a quick ID check is required at delivery.

Whether you're planning a day hike around Tbilisi, a weekend trip to Kazbegi, 
or a multi-day trek in Svaneti, we have the [category] you need. Browse our 
selection, pick your dates, and we'll deliver to your door.

[Your Brand] — quality hiking gear rental in Tbilisi, Georgia.
```

### Structured data

Most Shopify themes include Product and Organization schema automatically. Verify with Google Rich Results Test after launch.

Add LocalBusiness schema via theme `theme.liquid` or SEO app:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "[Your Brand]",
  "description": "Hiking gear rental with door delivery in Tbilisi, Georgia",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Tbilisi",
    "addressCountry": "GE"
  },
  "areaServed": "Tbilisi",
  "priceRange": "₾₾",
  "telephone": "[+995 XXX XXX XXX]",
  "url": "https://[yourbrand].com"
}
```

### Google tools

| Tool | Action |
|------|--------|
| Google Search Console | Add property, submit sitemap (`/sitemap.xml`) |
| Google Business Profile | Create listing when brand name finalized; category: Equipment Rental Service |
| Google Analytics 4 | Connect via Shopify Settings → Customer events |

### Target keywords

Primary (optimize homepage + collections):
- hiking gear rental Tbilisi
- tent rental Tbilisi
- backpack rental Tbilisi
- camping equipment rent Georgia
- sleeping bag rental Tbilisi

Long-tail (optimize product pages + blog Phase 2):
- rent camping gear delivered Tbilisi
- hiking equipment rental door delivery Georgia
- Kazbegi hiking gear rental
- weekend hiking kit rental Tbilisi

### SEO checklist

- [ ] Homepage title and description set
- [ ] All 8 collections have unique titles, descriptions, and 150+ word body text
- [ ] All 22 products have unique titles and descriptions
- [ ] All 10 static pages have SEO metadata
- [ ] All product images have alt text
- [ ] Sitemap submitted to Search Console
- [ ] Google Business Profile created
- [ ] GA4 connected
- [ ] Rich Results Test passed for sample product page

---

## Abandoned checkout recovery

**Settings → Checkout → Checkout settings → Abandoned checkouts**

| Setting | Value |
|---------|-------|
| Send abandoned checkout emails | Yes |
| Send to | All customers |
| Timing | 1 hour, then 24 hours |

Customize email to mention:
- Gear is reserved for limited time
- Cash on delivery — no payment needed now
- Door delivery in Tbilisi for 5 GEL
