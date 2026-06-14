# Order Confirmation Email

**Shopify path:** Settings → Notifications → Order confirmation → Edit code

Add the following block after the order line items section.

---

## Subject line

```
Your rental is confirmed — [Your Brand] · Order {{ order.name }}
```

---

## Email body (HTML block to add)

```html
<h2>Your rental is confirmed</h2>

<p>Hi {{ customer.first_name }},</p>

<p>Thank you for booking with [Your Brand]. Here are your rental details:</p>

<h3>Rental summary</h3>
<ul>
  <li><strong>Order:</strong> {{ order.name }}</li>
  <li><strong>Delivery address:</strong> {{ shipping_address | format_address }}</li>
  <li><strong>Payment:</strong> Cash on delivery — please have the exact amount ready</li>
</ul>

<h3>Amount due at delivery</h3>
<p><strong>{{ order.total_price | money }}</strong> (includes 5 GEL delivery)</p>

<h3>Before delivery day</h3>
<ol>
  <li><strong>Read your rental agreement</strong> — <a href="https://[yourbrand].com/pages/rental-agreement">View rental agreement</a></li>
  <li><strong>Bring valid ID</strong> — Georgian ID card or passport</li>
  <li><strong>Prepare cash</strong> — exact amount shown above</li>
  <li><strong>Be available</strong> during your selected delivery window</li>
</ol>

<h3>At delivery</h3>
<p>Our team will:</p>
<ul>
  <li>Present your gear for inspection</li>
  <li>Verify your ID (quick check)</li>
  <li>Have you sign the rental agreement</li>
  <li>Collect payment in cash</li>
  <li>Hand over your gear</li>
</ul>

<h3>Return pickup</h3>
<p>Return pickup is <strong>free</strong>. We will contact you before your rental end date to schedule collection at your address.</p>

<p>Questions? Reply to this email, WhatsApp us at [+995 XXX XXX XXX], or visit <a href="https://[yourbrand].com/pages/contact">our contact page</a>.</p>

<p>See you on the trail,<br>
The [Your Brand] Team</p>
```

---

## Plain text version

```
Your rental is confirmed — [Your Brand]

Hi {{ customer.first_name }},

Thank you for booking with [Your Brand].

ORDER: {{ order.name }}
DELIVERY ADDRESS: {{ shipping_address | format_address }}
AMOUNT DUE (CASH AT DELIVERY): {{ order.total_price | money }}

BEFORE DELIVERY DAY:
1. Read your rental agreement: https://[yourbrand].com/pages/rental-agreement
2. Bring valid ID (Georgian ID card or passport)
3. Prepare exact cash amount
4. Be available during your delivery window

Return pickup is FREE — we will contact you before your rental end date.

Questions? [email@yourbrand.ge] · [+995 XXX XXX XXX]
```
