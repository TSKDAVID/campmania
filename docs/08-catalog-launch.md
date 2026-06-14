# Catalog Launch Guide

Upload 22 starter products and 3 bundles using the product data in `templates/product-upload.csv`.

---

## Import methods

### Method A: Manual entry (recommended for first launch)

1. Open `templates/product-upload.csv`
2. For each row, create product in **Products → Add product**
3. Fill fields from CSV columns
4. Set metafields per `docs/05-product-template.md`
5. Sync to Booqable/Rentle
6. Upload 6+ photos
7. Assign to collection

### Method B: Shopify CSV import (basic fields only)

1. Convert CSV to Shopify import format (title, handle, type, tags, description, price)
2. **Products → Import**
3. After import, add metafields manually or via Matrixify app
4. Sync to Booqable for rental pricing

### Method C: Matrixify app (bulk with metafields)

1. Install Matrixify from Shopify App Store
2. Import `product-upload.csv` with metafield columns mapped
3. Sync to Booqable

---

## Collections setup

After products are created, assign to collections:

| Collection | Products to include |
|------------|---------------------|
| `tents-shelters` | 3 tent products |
| `backpacks` | 3 backpack products |
| `sleeping-systems` | 4 sleeping products |
| `cooking-water` | 3 cooking products |
| `navigation-safety` | 4 navigation products |
| `bundles` | 3 bundle products |
| `beginner-friendly` | All items tagged `beginner-friendly` |
| `all` | All products (automated: inventory > 0) |

---

## Bundle configuration

Bundles are manual collections or single products listing included items.

### Weekend Hiker Kit (`bundle-weekend-hiker`)

**Includes:**
- Osprey Talon 44L Backpack
- Sleeping Bag — Comfort 0°C
- Sea to Summit Insulated Sleeping Pad
- Black Diamond Spot 400 Headlamp

**Pricing:** 35 GEL/day · 85 GEL/weekend (3 days)

**Description:** List all included items with links to individual product pages.

### Family Camp Kit (`bundle-family-camp`)

**Includes:**
- Naturehike Cloud Peak 4P Tent
- 4× Sleeping Bag — Comfort 0°C
- Jetboil Flash Cooking System
- 4× Black Diamond Spot 400 Headlamp

**Pricing:** 55 GEL/day · 150 GEL/weekend

### Solo Trek Kit (`bundle-solo-trek`)

**Includes:**
- Deuter Aircontact 65+10L Backpack
- Naturehike Cloud Wing 1P Tent
- Sleeping Bag — Comfort 0°C
- Sea to Summit Insulated Sleeping Pad
- Jetboil Flash Cooking System
- Black Diamond Spot 400 Headlamp

**Pricing:** 45 GEL/day · 120 GEL/week

---

## Photography guidelines

Each product needs 6+ photos:

1. **Hero shot** — full item on white/neutral background
2. **Setup/use shot** — item in context (tent pitched, pack worn)
3. **Detail 1** — key feature close-up (zipper, buckle, valve)
4. **Detail 2** — second feature (logo, label, material)
5. **Packed/size reference** — next to common object for scale
6. **Accessories** — everything included laid out

**Specs:**
- Format: JPEG or WebP
- Min width: 1200px
- Max file size: 200KB (compress with TinyPNG or Shopify's auto-compress)
- Consistent background across catalog

---

## Availability setup (Booqable)

For each product:

| Setting | Value |
|---------|-------|
| Quantity | 1–3 (based on actual inventory) |
| Buffer after return | 1 day |
| Minimum rental | 1 day |
| Maximum advance booking | 90 days |

Block dates manually for maintenance or personal use.

---

## Pricing summary (GEL)

| Category | Daily range | Weekly range |
|----------|-------------|--------------|
| Tents | 30–45 | 70–100 |
| Backpacks | 18–30 | 45–75 |
| Sleeping | 5–20 | 15–55 |
| Cooking | 8–12 | 22–32 |
| Navigation | 5–15 | 14–40 |
| Bundles | 35–55 | 85–150 |

Adjust based on your actual gear value and local market.

---

## Pre-publish checklist (per product)

- [ ] Title and handle set
- [ ] 6+ photos uploaded with alt text
- [ ] Description written (use template from `docs/05-product-template.md`)
- [ ] Metafields filled (daily rate, weekly rate, specs, condition, included)
- [ ] Booqable sync complete with availability
- [ ] Assigned to correct collection(s)
- [ ] SEO title and description set
- [ ] Tags applied
- [ ] Product status: Active

---

## Launch inventory count

| Category | Count | Status |
|----------|-------|--------|
| Tents | 3 | |
| Backpacks | 3 | |
| Sleeping systems | 4 | |
| Cooking & water | 3 | |
| Navigation & safety | 4 | |
| Bundles | 3 | |
| **Total** | **22** | |

Target: 20–30 SKUs at launch. Add more products post-launch based on demand.
