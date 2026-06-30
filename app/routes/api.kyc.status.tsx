import type {Route} from './+types/api.kyc.status';
import {
  adminGetCustomerTags,
  applyKycCustomerUpdate,
} from '~/lib/shopify-admin';
import {
  corsPreflight,
  isCheckoutExtensionAuthorized,
  withCors,
} from '~/lib/api/cors';
import {
  getKycCheckoutStatus,
  isKycVerified,
  isRentalBlocked,
} from '~/lib/trailrent/kyc';
import {parseCustomerTags} from '~/lib/trailrent/loyalty';

const CUSTOMER_TAGS_QUERY = `#graphql
  query KycStatusCustomer {
    customer {
      id
      tags
    }
  }
` as const;

function jsonResponse(
  request: Request,
  body: unknown,
  status = 200,
): Response {
  return withCors(request, Response.json(body, {status}));
}

function normalizeCustomerId(value: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('gid://shopify/Customer/')) return value;
  if (/^\d+$/.test(value)) return `gid://shopify/Customer/${value}`;
  return null;
}

async function readTagsFromCustomerAccount(
  context: Route.LoaderArgs['context'],
): Promise<string[]> {
  const loggedIn = await context.customerAccount.isLoggedIn();
  if (!loggedIn) return [];

  const {data} = await context.customerAccount.query(CUSTOMER_TAGS_QUERY);
  return parseCustomerTags(data?.customer?.tags);
}

export async function loader({request, context}: Route.LoaderArgs) {
  const preflight = corsPreflight(request);
  if (preflight) return preflight;

  const url = new URL(request.url);
  const requestedCustomerId = normalizeCustomerId(
    url.searchParams.get('customerId'),
  );

  let tags: string[] = [];

  if (requestedCustomerId) {
    const extensionOk = isCheckoutExtensionAuthorized(
      request,
      context.env.CHECKOUT_EXTENSION_SECRET,
    );

    if (extensionOk && context.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
      try {
        tags = await adminGetCustomerTags(context.env, requestedCustomerId);
      } catch {
        tags = [];
      }
    } else {
      tags = await readTagsFromCustomerAccount(context);
    }
  } else {
    tags = await readTagsFromCustomerAccount(context);
  }

  const status = getKycCheckoutStatus(tags);
  const loggedIn = await context.customerAccount.isLoggedIn();

  return jsonResponse(request, {
    verified: isKycVerified(tags),
    blocked: isRentalBlocked(tags),
    status,
    loggedIn,
  });
}

export async function action({request}: Route.ActionArgs) {
  const preflight = corsPreflight(request);
  if (preflight) return preflight;
  return jsonResponse(request, {error: 'method_not_allowed'}, 405);
}
