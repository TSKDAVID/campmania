# Homepage promo carousel (metaobjects)

The homepage hero is a **carousel of promo slides** loaded from Shopify **metaobjects**. Merchants can add, edit, reorder, or hide slides in Admin without code deploys.

## One-time setup (developer)

From the `campmania` folder, with Shopify CLI authenticated to `b6dvzp-py.myshopify.com`:

```powershell
shopify store auth --store b6dvzp-py.myshopify.com --scopes read_metaobject_definitions,write_metaobject_definitions,read_metaobjects,write_metaobjects

shopify store execute --store b6dvzp-py.myshopify.com --query (Get-Content -Raw scripts/setup-homepage-promo-slides.graphql)

shopify store execute --store b6dvzp-py.myshopify.com --query (Get-Content -Raw scripts/seed-homepage-promo-slides.graphql)
```

If the definition already exists, the setup mutation returns a user error — that is safe to ignore.

## Metaobject type: `homepage_promo_slide`

| Field key | Type | Required | Notes |
|-----------|------|----------|-------|
| `title_en` | Single line text | Yes | English headline (also used as Admin display name) |
| `title_ka` | Single line text | Yes | Georgian headline |
| `subtitle_en` | Multi-line text | No | English subcopy |
| `subtitle_ka` | Multi-line text | No | Georgian subcopy |
| `badge_en` | Single line text | No | Small pill above title (English) |
| `badge_ka` | Single line text | No | Badge (Georgian) |
| `cta_label_en` | Single line text | No | Button label (English) |
| `cta_label_ka` | Single line text | No | Button label (Georgian) |
| `link_url` | Single line text | Yes | e.g. `/collections/all`, `/packages`, or full URL |
| `image` | File (image) | No | Upload in **Content → Files**, then pick on the slide |
| `sort_order` | Integer | No | Lower numbers show first (0, 1, 2…) |
| `active` | Boolean | No | Uncheck to hide a slide without deleting |

**Storefront API:** definition must allow **Storefront** access (`PUBLIC_READ`). The setup script sets this automatically.

## Merchant: add or edit a slide

1. In Shopify Admin, go to **Content → Metaobjects**.
2. Open **Homepage promo slide** (type `homepage_promo_slide`).
3. Click **Add entry** (or edit an existing slide).
4. Fill in **English and Georgian** titles (and optional subtitle, badge, CTA).
5. Set **Link URL** to where the banner should go.
6. Upload a wide landscape image under **Background image** (recommended ~2000×900px).
7. Set **Sort order** (0 = first).
8. Leave **Active** checked to publish.
9. **Save**.

Changes appear on the storefront after cache refresh (usually within a few minutes; Hydrogen caches Storefront API responses).

## Carousel behavior

- Multiple active slides → carousel with prev/next, dots, auto-advance (~6.5s), swipe on mobile.
- One slide → static hero (no controls).
- **No metaobjects** → site falls back to built-in Georgian/English copy from the theme (same as before).

## Locale

The storefront language switcher (Georgian / English) picks `_ka` or `_en` fields on each slide. If a locale field is empty, the theme falls back to the other language.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Slides not showing | Confirm **Active** is checked and titles are filled |
| Old content still visible | Wait for CDN/cache or redeploy Oxygen |
| Image missing | Re-select file on the metaobject; ensure image is in **Files** |
| Type not in Admin | Re-run `setup-homepage-promo-slides.graphql` |
