# Product Page Template Configuration

Configure the rental product template in Shopify Theme Editor and Admin.

---

## Template structure

**Online Store → Themes → Customize → Products → Default product**

Section order:

1. Product information (theme default)
2. **COD delivery notice** (`cod-delivery-notice.liquid`)
3. **Booqable/Rentle app block** — date picker widget
4. Add to cart / Check availability button
5. Product description
6. **Product specs** — render `{% render 'product-specs', product: product %}`
7. Complementary products — "Complete your kit"
8. Judge.me reviews widget
9. FAQ accordion (product-specific, optional)

---

## Metafield definitions

Create in **Settings → Custom data → Products → Add definition**:

| Name | Namespace and key | Type | Description |
|------|-------------------|------|-------------|
| Daily rate | `rental.daily_rate` | Money | Daily rental price in GEL |
| Weekly rate | `rental.weekly_rate` | Money | Weekly rental price in GEL |
| Deposit amount | `rental.deposit_amount` | Money | Refundable security deposit (optional) |
| What's included | `rental.whats_included` | Rich text | Bullet list of included items |
| Condition grade | `rental.condition_grade` | Single line text | Excellent or Good |
| Brand | `specs.brand` | Single line text | Manufacturer brand |
| Capacity | `specs.capacity` | Single line text | e.g. 2-person, 65L |
| Weight (kg) | `specs.weight_kg` | Decimal | Packed weight in kg |
| Season rating | `specs.season_rating` | Single line text | e.g. 3-season, 4-season |

### Display metafields on product page

Add to `main-product.liquid` or via Theme Editor custom liquid block:

```liquid
{% render 'product-specs', product: product %}
```

---

## Product description template

Use this structure for every product description:

```markdown
## About this item
[2-3 sentences describing the gear and ideal use cases in Georgia]

## Ideal for
- [Use case 1, e.g. Weekend hikes near Tbilisi]
- [Use case 2, e.g. Multi-day treks in Kazbegi]
- [Use case 3]

## Rental notes
- Pay cash on delivery
- Rental agreement emailed after booking
- Valid ID required at delivery
- Free return pickup in Tbilisi
```

---

## Pricing display

Booqable/Rentle handles live pricing based on selected dates. Also show static "from" pricing via metafields:

**Theme custom liquid block (below title):**

```liquid
{% if product.metafields.rental.daily_rate %}
  <p class="product-price-from">
    From {{ product.metafields.rental.daily_rate | money }}/day
    {% if product.metafields.rental.weekly_rate %}
      · {{ product.metafields.rental.weekly_rate | money }}/week
    {% endif %}
  </p>
{% endif %}
```

---

## Add to cart button label

Change default "Add to cart" to **"Check availability & book"** in Theme Editor → Product page → Product information → Buy buttons.

---

## Product card (collection pages)

Add to collection product card snippet:

```liquid
{% render 'delivery-badge' %}
{% if product.metafields.rental.daily_rate %}
  <span class="price-from">From {{ product.metafields.rental.daily_rate | money }}/day</span>
{% endif %}
```

---

## Booqable widget configuration

In Booqable app settings:

1. Enable **Product page widget**
2. Position: Below price, above add to cart
3. Show: Date range picker, live price, availability status
4. Currency: GEL
5. Minimum rental: 1 day
6. Buffer days between rentals: 1

---

## Product-specific FAQs (optional metafield)

Add metafield `rental.product_faq` (JSON) for product-specific questions, or use the FAQ accordion section with product tags to show relevant questions.

Example for tents:
- **Q:** Is a footprint included? **A:** Yes, a footprint is included with all tent rentals.
- **Q:** Can I set this up alone? **A:** Yes, this tent is designed for solo setup in under 5 minutes.

---

## Import workflow

1. Import products from `templates/product-upload.csv` via Shopify CSV import or manual entry
2. Fill metafields for each product (CSV import does not include metafields — set via bulk editor or Matrixify app)
3. Sync each product to Booqable/Rentle
4. Set availability calendar per item
5. Upload 6+ photos per product (consistent white/neutral background)
6. Assign to collections
7. Set SEO title and description from CSV
