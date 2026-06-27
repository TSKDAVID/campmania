import type {Route} from './+types/api.webhooks.didit';
import {
  isDiditEventProcessed,
  markDiditEventProcessed,
} from '~/lib/didit/idempotency';
import {verifyDiditWebhook} from '~/lib/didit/webhook';
import {applyKycCustomerUpdate} from '~/lib/shopify-admin';
import {kycTagsForDiditStatus} from '~/lib/trailrent/kyc';

function normalizeVendorCustomerId(vendorData: unknown): string | null {
  if (typeof vendorData !== 'string' || !vendorData.trim()) return null;
  if (vendorData.startsWith('gid://shopify/Customer/')) return vendorData;
  if (/^\d+$/.test(vendorData)) return `gid://shopify/Customer/${vendorData}`;
  return vendorData;
}

export async function loader() {
  return new Response('ok', {status: 200});
}

export async function action({request, context}: Route.ActionArgs) {
  const secret = context.env.DIDIT_WEBHOOK_SECRET;
  if (!secret) {
    return new Response('not configured', {status: 503});
  }

  const raw = await request.text();
  const verified = await verifyDiditWebhook(raw, request.headers, secret);

  if (!verified.ok) {
    return new Response(verified.message, {status: verified.status});
  }

  const event = verified.parsed;
  const eventId = typeof event.event_id === 'string' ? event.event_id : '';

  if (eventId && (await isDiditEventProcessed(eventId))) {
    return new Response('ok');
  }

  const customerId = normalizeVendorCustomerId(event.vendor_data);
  const status = typeof event.status === 'string' ? event.status : '';
  const sessionId =
    typeof event.session_id === 'string' ? event.session_id : undefined;

  if (customerId && context.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
    const {add, remove} = kycTagsForDiditStatus(status);

    if (add.length || remove.length || status) {
      try {
        await applyKycCustomerUpdate(context.env, customerId, {
          status: status || 'unknown',
          sessionId,
          addTags: add,
          removeTags: remove,
        });
      } catch (error) {
        console.error('Didit webhook customer update failed', error);
      }
    }
  }

  if (eventId) {
    await markDiditEventProcessed(eventId);
  }

  return new Response('ok');
}
