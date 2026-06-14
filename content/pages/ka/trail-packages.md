# Trail Packages Page

**Page title:** ბილიკის კომპლექტები  
**URL handle:** trail-packages  
**Theme template:** trail-packages  

---

Create this page in **Shopify Admin → Online Store → Pages → Add page**.

Leave the body empty — the theme template renders the full catalog with filters.

## Tag your package products

Each **kit is one Shopify product**. Tag it like this:

```
type:package
trek:Tobavarchkhili
duration:2-day
difficulty:moderate
bundle:2-person-tent
bundle: sleeping-bag-minus-10
item:Headlamp
item:First aid kit
```

- **bundle:product-handle** — links to another product for photo + name on the complect card  
- **item:Name** — text-only item when no separate product exists  
- Or use metafield **rental.whats_included** (rich text list) as fallback  

## Optional: dedicated collection

Later you can create collection `packages`, assign template **packages**, and pick that collection in the section settings.
