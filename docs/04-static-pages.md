# Phase 4: Static Pages Setup

Create each page in **Shopify Admin → Online Store → Pages → Add page**.

For each page:
1. Set the **Title** and **URL handle** as specified
2. Paste body content from the corresponding file in `content/pages/`
3. Set SEO title and description from `templates/seo-metadata.csv`
4. Add relevant theme sections where noted

## Pages to create

| Title | Handle | Content file | Theme sections |
|-------|--------|--------------|----------------|
| How It Works | `how-it-works` | `how-it-works.md` | `how-it-works`, `cta-banner` |
| Delivery | `delivery` | `delivery.md` | — |
| Pricing | `pricing` | `pricing.md` | — |
| Gear Quality | `gear-quality` | `gear-quality.md` | — |
| Rental Agreement | `rental-agreement` | `../rental-agreement.md` | — |
| FAQ | `faq` | `faq.md` | `faq-accordion` |
| About | `about` | `about.md` | `why-us` |
| Contact | `contact` | `contact.md` | Shopify contact form |
| Refund Policy | `refund-policy` | `refund-policy.md` | — |

## Homepage

Homepage is configured in Theme Editor, not as a Page. Use section copy from `content/pages/homepage.md`.

## Collections to create

**Products → Collections → Create collection**

| Title | Handle | Description source |
|-------|--------|-------------------|
| All Rental Gear | `all` | seo-metadata.csv |
| Tents & Shelters | `tents-shelters` | seo-metadata.csv |
| Backpacks | `backpacks` | seo-metadata.csv |
| Sleeping Systems | `sleeping-systems` | seo-metadata.csv |
| Cooking & Water | `cooking-water` | seo-metadata.csv |
| Navigation & Safety | `navigation-safety` | seo-metadata.csv |
| Adventure Bundles | `bundles` | seo-metadata.csv |
| Beginner Friendly | `beginner-friendly` | seo-metadata.csv |

Set collection type to **Manual** initially; switch to automated rules once products are tagged.

## Navigation update

After all pages exist, verify links in **Online Store → Navigation** match the handles above.
