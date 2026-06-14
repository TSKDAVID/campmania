# Phase 9: Languages — Georgian default + English switcher

The TrailRent theme ships with **Georgian (ka)** as the default language and **English (en)** as a secondary language.

## Theme locale files

| File | Language |
|------|----------|
| `theme/locales/ka.default.json` | Georgian (default) |
| `theme/locales/en.json` | English |

These files translate theme UI strings: buttons, cart, footer, product labels, COD notices, accessibility messages, etc.

## Shopify Admin setup (required)

After uploading the theme:

### 1. Enable languages

1. **Settings → Languages**
2. Confirm **Georgian** is listed. If not, click **Add language → Georgian**
3. Click **Add language → English**
4. Set **Georgian** as the **default** language (Publish if prompted)

### 2. Publish both languages

For each language (Georgian and English):
- Click **Publish** so the storefront is available in that language

### 3. Language switcher

The theme includes a **language dropdown in the header** (globe icon). It appears automatically when more than one language is published.

Customers switch between ქართული and English — Shopify handles URLs and locale persistence.

## What is translated automatically

| Area | Source |
|------|--------|
| Buttons, cart, search, footer labels | `ka.default.json` / `en.json` |
| COD / delivery notices | `rental.*` keys in locale files |
| Product specs table headers | `products.product.*` keys |
| Announcement bar (if text field empty) | `rental.announcement` |
| Header CTA (if text field empty) | `sections.header.browse_gear` |
| Accessibility messages | `accessibility.*` keys |

## What you must translate manually

Theme locale files do **not** translate:

| Content | How to translate |
|---------|------------------|
| **Homepage section text** (hero, FAQ, reviews) | Pre-filled in Georgian in `templates/index.json`. Use **Translate & Adapt** for English versions |
| **Shopify Pages** (How It Works, FAQ, etc.) | Paste from `content/pages/ka/` (Georgian) or `content/pages/` (English), OR use Translate & Adapt |
| **Products** (titles, descriptions) | Use `templates/product-upload-ka.csv` for Georgian, `templates/product-upload.csv` for English |
| **Collections** | Translate titles/descriptions in admin |
| **Navigation menus** | **Online Store → Navigation** — translate menu item titles per language |
| **Policies** | Settings → Policies — translate each policy |
| **Emails** | Use `content/emails/ka/` or `content/emails/` templates in Shopify Notifications |

### Recommended: Translate & Adapt app

1. Install **Translate & Adapt** (free from Shopify)
2. Translate pages, products, collections, and menus into English
3. Georgian remains default; English available via header switcher
4. **Important:** Homepage section strings (hero heading, FAQ questions) do not auto-switch — translate these in Translate & Adapt under Theme content, or duplicate section settings per language in Theme Editor

## Page content (Georgian copies)

Georgian page copy lives in **`content/pages/ka/`**:

| File | URL handle | Georgian title |
|------|------------|----------------|
| `how-it-works.md` | how-it-works | როგორ მუშაობს |
| `delivery.md` | delivery | მიწოდება და დაბრუნების აღება |
| `faq.md` | faq | ხშირად დასმული კითხვები |
| `about.md` | about | ჩვენს შესახებ |
| `contact.md` | contact | დაგვიკავშირდით |
| `pricing.md` | pricing | ფასები |
| `gear-quality.md` | gear-quality | აღჭურვილობის ხარისხი |
| `homepage.md` | — | მთავარი გვერდის ტექსტი |
| `refund-policy.md` | refund-policy | თანხის დაბრუნების პოლიტიკა |

English copies remain in `content/pages/`.

## Email templates (Georgian)

Georgian email copy: **`content/emails/ka/`**

- `order-confirmation.md`
- `delivery-reminder.md`
- `return-reminder.md`
- `review-request.md`

## Product catalog (Georgian)

Use **`templates/product-upload-ka.csv`** for Georgian product titles and descriptions. Columns include `title_ka`, `description_ka`, `seo_title_ka`, `seo_description_ka`.

English catalog: **`templates/product-upload.csv`**

## Navigation menus (Georgian)

Create menus with Georgian titles:

**Main menu (main-menu):**
```
აღჭურვილობის ქირა (dropdown)
  → ყველა
  → ანსამბლები
  → რუქსაკები
  ...
როგორ მუშაობს
მიწოდება
კითხვები
ჩვენს შესახებ
```

**Footer menu:**
```
როგორ მუშაობს, მიწოდება, კითხვები, კონტაქტი, ქირის ხელშეკრულება
```

## Adding more languages later

1. Settings → Languages → Add language
2. Create `theme/locales/[code].json` copying structure from `en.json`
3. Translate via Translate & Adapt

## Checklist

- [ ] Georgian set as default in Settings → Languages
- [ ] English added and published
- [ ] Language switcher visible in header
- [ ] Navigation menus in Georgian
- [ ] Pages created with Georgian content from `content/pages/ka/`
- [ ] Products uploaded with Georgian titles (`product-upload-ka.csv`)
- [ ] Email notifications configured with Georgian templates
- [ ] English translations added via Translate & Adapt (optional at launch)
