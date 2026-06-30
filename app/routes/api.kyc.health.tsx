import type {Route} from './+types/api.kyc.health';
import {corsPreflight, withCors} from '~/lib/api/cors';

function jsonResponse(
  request: Request,
  body: unknown,
  status = 200,
): Response {
  return withCors(request, Response.json(body, {status}));
}

export async function loader({request, context}: Route.LoaderArgs) {
  const preflight = corsPreflight(request);
  if (preflight) return preflight;

  const {env} = context;

  return jsonResponse(request, {
    diditConfigured: Boolean(env.DIDIT_API_KEY),
    webhookConfigured: Boolean(env.DIDIT_WEBHOOK_SECRET),
    adminConfigured: Boolean(env.SHOPIFY_ADMIN_API_ACCESS_TOKEN),
    storefrontOriginConfigured: Boolean(env.PUBLIC_STOREFRONT_ORIGIN),
  });
}

export async function action({request}: Route.ActionArgs) {
  const preflight = corsPreflight(request);
  if (preflight) return preflight;
  return jsonResponse(request, {error: 'method_not_allowed'}, 405);
}
