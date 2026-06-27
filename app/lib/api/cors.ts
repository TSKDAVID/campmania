const CHECKOUT_EXTENSION_ORIGINS = [
  'https://extensions.shopifycdn.com',
  'https://checkout.shopify.com',
  'https://checkout.shopifycs.com',
];

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (CHECKOUT_EXTENSION_ORIGINS.some((allowed) => origin.startsWith(allowed))) {
    return true;
  }
  return (
    origin.endsWith('.myshopify.com') ||
    origin.endsWith('.myshopify.dev') ||
    origin.endsWith('.shopify.com')
  );
}

export function withCors(
  request: Request,
  response: Response,
  methods = 'GET, POST, OPTIONS',
): Response {
  const origin = request.headers.get('Origin') ?? '';
  const headers = new Headers(response.headers);

  if (isAllowedOrigin(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }

  headers.set('Access-Control-Allow-Methods', methods);
  headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Campmania-Checkout-Secret',
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function corsPreflight(request: Request): Response | null {
  if (request.method !== 'OPTIONS') return null;
  return withCors(request, new Response(null, {status: 204}));
}

export function isCheckoutExtensionAuthorized(
  request: Request,
  secret?: string,
): boolean {
  if (!secret) return false;
  return request.headers.get('X-Campmania-Checkout-Secret') === secret;
}
