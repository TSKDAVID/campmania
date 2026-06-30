import type {Route} from './+types/api.kyc.session';
import {DIDIT_SESSION_API, DIDIT_WORKFLOW_ID} from '~/lib/didit/constants';
import {
  corsPreflight,
  isCheckoutExtensionAuthorized,
  withCors,
} from '~/lib/api/cors';

const CUSTOMER_ID_QUERY = `#graphql
  query KycSessionCustomer {
    customer {
      id
      emailAddress {
        emailAddress
      }
    }
  }
` as const;

function jsonResponse(
  request: Request,
  body: unknown,
  status = 200,
): Response {
  return withCors(
    request,
    Response.json(body, {status}),
    'GET, POST, OPTIONS',
  );
}

function normalizeCustomerId(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  if (value.startsWith('gid://shopify/Customer/')) return value;
  if (/^\d+$/.test(value)) return `gid://shopify/Customer/${value}`;
  return null;
}

export async function loader({request}: Route.LoaderArgs) {
  const preflight = corsPreflight(request);
  if (preflight) return preflight;
  return jsonResponse(request, {error: 'method_not_allowed'}, 405);
}

export async function action({request, context}: Route.ActionArgs) {
  const preflight = corsPreflight(request);
  if (preflight) return preflight;

  if (request.method !== 'POST') {
    return jsonResponse(request, {error: 'method_not_allowed'}, 405);
  }

  const {env, customerAccount} = context;
  const apiKey = env.DIDIT_API_KEY;

  if (!apiKey) {
    return jsonResponse(request, {error: 'didit_not_configured'}, 503);
  }

  let customerId: string | null = null;
  let email: string | null = null;

  const loggedIn = await customerAccount.isLoggedIn();
  if (loggedIn) {
    const {data} = await customerAccount.query(CUSTOMER_ID_QUERY);
    customerId = data?.customer?.id ?? null;
    email = data?.customer?.emailAddress?.emailAddress ?? null;
  }

  const body = (await request.json().catch(() => ({}))) as {
    customerId?: string;
    email?: string;
  };

  if (!customerId) {
    const extensionOk = isCheckoutExtensionAuthorized(
      request,
      env.CHECKOUT_EXTENSION_SECRET,
    );
    if (!extensionOk) {
      return jsonResponse(request, {error: 'login_required'}, 401);
    }

    customerId = normalizeCustomerId(body.customerId);
    email = typeof body.email === 'string' ? body.email : null;

    if (!customerId) {
      return jsonResponse(request, {error: 'customer_id_required'}, 400);
    }
  }

  const origin = new URL(request.url).origin;
  const callback = `${origin}/verify/done`;

  const sessionResponse = await fetch(DIDIT_SESSION_API, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_id: DIDIT_WORKFLOW_ID,
      vendor_data: customerId,
      callback,
      metadata: {
        email,
        source: 'campmania_storefront',
      },
    }),
  });

  if (!sessionResponse.ok) {
    const detail = await sessionResponse.text();
    return jsonResponse(
      request,
      {error: 'session_create_failed', detail},
      502,
    );
  }

  const session = (await sessionResponse.json()) as {
    url?: string;
    session_id?: string;
  };

  return jsonResponse(request, {
    url: session.url,
    session_id: session.session_id,
  });
}
