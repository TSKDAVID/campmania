# Checkout Agreement Checkbox

Add this at checkout via **Shopify Checkout Blocks** (Settings → Checkout → Customize) or a checkout extension app.

---

## Checkbox label (required)

```
I agree to the Rental Agreement and understand that a valid government-issued ID and signed 
agreement are required at delivery. I have read or will read the agreement sent to my email 
before delivery day.
```

**Link text:** "Rental Agreement" → `https://[yourbrand].com/pages/rental-agreement`

---

## Helper text (below checkbox)

```
Payment is cash on delivery. You will pay [order total] when we deliver your gear. 
Return pickup is free.
```

---

## Shopify Checkout Blocks setup

1. Go to **Settings → Checkout → Customize checkout**
2. Add block: **Custom field** or **Checkbox** (Shopify Plus) OR use app: **Checkout Blocks** (free tier)
3. Field type: Checkbox (required)
4. Label: paste checkbox label above
5. Link Rental Agreement URL in label HTML if supported

### Alternative for non-Plus stores

Add agreement text to **Settings → Checkout → Order status page** and **Cart page** with required acknowledgment:

**Cart page notice (theme section or cart.liquid):**

```html
<div class="cart-agreement-notice">
  <p>By proceeding to checkout, you agree to our 
  <a href="/pages/rental-agreement" target="_blank">Rental Agreement</a> 
  and understand that ID verification and a signed agreement are required at delivery. 
  Payment is cash on delivery.</p>
</div>
```

Add matching order note at checkout:
- **Settings → Checkout → Order processing → Additional scripts** (if available)
- Or use **Order notes** field label: "I confirm I have read the Rental Agreement"

---

## Order note field label

**Settings → Checkout → Customer contact → Order notes**

Enable order notes with label:

```
Delivery instructions (gate code, floor, contact phone for driver)
```

---

## COD payment instructions (Settings → Payments → Manual payment)

```
Pay in cash when your gear is delivered. Please have the exact amount ready.

Required at delivery:
• Valid government-issued ID (Georgian ID card or passport)
• Signed rental agreement (emailed to you after booking)

Your rental agreement: https://[yourbrand].com/pages/rental-agreement
```
