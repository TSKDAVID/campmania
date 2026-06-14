# Delivery Reminder Email

**Trigger:** 1 day before scheduled delivery
**Tool:** Shopify Email, Klaviyo, or manual send

---

## Subject line

```
Delivery tomorrow — [Your Brand] · Order [ORDER_NUMBER]
```

---

## Email body

```
Hi [CUSTOMER_NAME],

Your hiking gear is being prepared and will be delivered tomorrow.

DELIVERY DETAILS
────────────────
Date: [DELIVERY_DATE]
Time window: [DELIVERY_WINDOW]
Address: [DELIVERY_ADDRESS]
Amount due (cash): [TOTAL_GEL] GEL

PLEASE HAVE READY
─────────────────
✓ Valid ID (Georgian ID card or passport)
✓ Exact cash: [TOTAL_GEL] GEL
✓ Someone available to receive delivery

YOUR RENTAL AGREEMENT
─────────────────────
If you haven't already, please read your rental agreement:
https://[yourbrand].com/pages/rental-agreement

At delivery, you'll sign a paper copy after inspecting your gear together.

DELIVERY INSTRUCTIONS
─────────────────────
[DELIVERY_NOTES_FROM_ORDER]

Need to reschedule? Contact us as soon as possible:
Email: [email@yourbrand.ge]
WhatsApp: [+995 XXX XXX XXX]

See you tomorrow,
The [Your Brand] Team
```

---

## Automation setup (Shopify Flow / Klaviyo)

**Trigger condition:** Order tag contains `delivery-[DATE]` OR 1 day before metafield `delivery_date`

**Filter:** Order financial status = pending (COD not yet collected)
