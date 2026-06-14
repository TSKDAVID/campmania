# Phase 3: Theme Design — TrailRent Heritage

This project includes **TrailRent**, a complete Shopify theme — not add-on sections for another theme. Version **1.2.0** introduces the **Heritage** design system: Filson-inspired editorial outdoor aesthetic with warm cream backgrounds, serif headlines, and stroke SVG icons.

Upload the `theme/` folder directly to Shopify.

---

## What TrailRent includes

| Component | Status |
|-----------|--------|
| Layout (header, footer, main shell) | Included |
| Homepage with all rental sections | Included |
| Product page with COD notice, specs, gallery | Included |
| Collection, cart, page, search, 404 templates | Included |
| Mobile navigation | Included |
| Heritage design system (colors, typography, icons) | Included |
| Rental-specific sections (trust bar, how-it-works, FAQ, etc.) | Included |
| Georgian + English locale files | Included |

**You do not need to purchase or install Dawn, Prestige, or Impulse.**

---

## Upload instructions

See [`theme/README.md`](../theme/README.md) for full upload steps.

**Quick path:**
1. Zip the contents of the `theme/` folder
2. Shopify Admin → Online Store → Themes → Add theme → Upload zip
3. Publish

---

## Heritage design system

Configured in **Theme settings → Colors**:

| Token | Default | Usage |
|-------|---------|-------|
| Primary | `#2C2417` | Header, footer, headings, primary buttons |
| Primary light | `#4A3F35` | Button hover |
| Accent | `#8B6914` | Links, eyebrows, focus rings |
| Background | `#F4F1EA` | Warm cream page background |
| Text | `#1C1917` | Body copy |
| Muted | `#5C5346` | Secondary text (WCAG-safe on cream) |
| Border | `#D4CFC4` | Dividers, card edges |

### Typography

Loaded via Google Fonts in `snippets/font-faces.liquid`:

| Role | Font |
|------|------|
| Display / headings | Noto Serif Georgian + Libre Baskerville |
| Nav / labels / buttons | Barlow Condensed |
| Body | Noto Sans Georgian + Barlow |

Both Georgian and English render correctly with full glyph support.

### Icons

Stroke SVG icons via `snippets/icon.liquid` — no emojis. Used in trust bar, why-us, COD notices, FAQ chevrons. Theme Editor icon pickers: check, truck, return, cash, shield, calendar, document, tag.

### CSS layers

| File | Purpose |
|------|---------|
| `assets/base.css` | Layout, header, footer, product/cart foundations |
| `assets/rental-store.css` | Rental-specific overrides |
| `assets/heritage.css` | Heritage editorial design system |

---

## Homepage (pre-built)

The homepage is configured in `theme/templates/index.json` with **Georgian** section content:

1. Hero rental
2. Trust bar (compact strip)
3. How it works (compact strip)
4. Featured gear (6 products — 3×2 desktop, 2×3 mobile)
5. Category grid (full-bleed tiles)
6. Why us
7. Reviews carousel
8. FAQ accordion
9. CTA banner

Customize all sections visually in Theme Editor.

---

## Product page

Template: `theme/templates/product.json`

Includes:
- Image gallery with thumbnails
- Price + daily/weekly metafield rates
- COD / delivery / ID notice (SVG icons)
- Add to cart ("Check availability & book")
- Product description
- Specs metafields table
- Product recommendations
- FAQ accordion

**Add rental date picker:** Theme Editor → Product page → Add block → Booqable/Rentle app block (place above buy button).

---

## Collection page

- Collection banner with title and description
- Product grid with delivery badge and daily rate
- Pagination

---

## Cart page

- Rental agreement notice (toggle in Theme settings)
- Delivery instructions field
- 5 GEL delivery note
- COD checkout flow

---

## Custom sections reference

| Section | Use on |
|---------|--------|
| `announcement-bar-rental` | Global (in layout) |
| `hero-rental` | Homepage |
| `trust-bar` | Homepage, any page |
| `how-it-works` | Homepage, How It Works page |
| `category-grid` | Homepage |
| `featured-collection` | Homepage, collections |
| `why-us` | Homepage, About page |
| `reviews-carousel` | Homepage (replace with Judge.me later) |
| `faq-accordion` | Homepage, FAQ, product pages |
| `cta-banner` | Homepage, any page |
| `cod-delivery-notice` | Optional standalone (also built into main-product) |

---

## Mobile

- Responsive grid layouts
- Mobile slide-out navigation
- Sticky "Check availability" bar on product pages
- Touch-friendly FAQ accordion

---

## Theme QA checklist

- [ ] Theme uploaded and published
- [ ] Logo uploaded in Theme settings
- [ ] Heritage colors look correct (cream bg, dark brown header)
- [ ] Georgian headings render in Noto Serif Georgian
- [ ] No emojis in trust bar or COD notices (SVG icons only)
- [ ] Navigation menus created and linked
- [ ] Homepage sections populated with images
- [ ] Product page shows COD notice and specs
- [ ] Booqable date picker added via app block
- [ ] Cart shows rental agreement notice
- [ ] Mobile menu works
- [ ] All templates load without errors

## Next step

Paste page content from `content/pages/ka/` (Georgian) or `content/pages/` (English) into Shopify Pages (see [`04-static-pages.md`](04-static-pages.md)).
