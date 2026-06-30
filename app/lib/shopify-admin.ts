type AdminEnv = {
  PUBLIC_STORE_DOMAIN?: string;
  SHOPIFY_ADMIN_API_ACCESS_TOKEN?: string;
  SHOPIFY_CLIENT_ID?: string;
  SHOPIFY_CLIENT_SECRET?: string;
};

type AdminGraphqlResult<T> = {
  data?: T;
  errors?: Array<{message: string}>;
};

type AdminTokenCache = {
  token: string;
  expiresAt: number;
};

let adminTokenCache: AdminTokenCache | null = null;

export function isAdminApiConfigured(env: AdminEnv): boolean {
  return Boolean(
    env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ||
      (env.SHOPIFY_CLIENT_ID &&
        env.SHOPIFY_CLIENT_SECRET &&
        env.PUBLIC_STORE_DOMAIN),
  );
}

async function getAdminAccessToken(env: AdminEnv): Promise<string> {
  if (env.SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
    return env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
  }

  const domain = env.PUBLIC_STORE_DOMAIN;
  const clientId = env.SHOPIFY_CLIENT_ID;
  const clientSecret = env.SHOPIFY_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    throw new Error('Admin API is not configured');
  }

  const now = Date.now();
  if (adminTokenCache && adminTokenCache.expiresAt > now + 60_000) {
    return adminTokenCache.token;
  }

  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Admin token exchange failed: ${response.status} ${detail}`);
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!payload.access_token) {
    throw new Error('Admin token exchange returned no access_token');
  }

  const expiresInMs = (payload.expires_in ?? 86_399) * 1000;
  adminTokenCache = {
    token: payload.access_token,
    expiresAt: now + expiresInMs,
  };

  return adminTokenCache.token;
}

async function adminGraphql<T>(
  env: AdminEnv,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const domain = env.PUBLIC_STORE_DOMAIN;
  const token = await getAdminAccessToken(env);

  if (!domain) {
    throw new Error('Admin API is not configured');
  }

  const response = await fetch(
    `https://${domain}/admin/api/2026-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({query, variables}),
    },
  );

  if (!response.ok) {
    throw new Error(`Admin API HTTP ${response.status}`);
  }

  const payload = (await response.json()) as AdminGraphqlResult<T>;
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }

  if (!payload.data) {
    throw new Error('Admin API returned no data');
  }

  return payload.data;
}

export async function adminTagsAdd(
  env: AdminEnv,
  customerId: string,
  tags: string[],
): Promise<void> {
  if (!tags.length) return;

  const data = await adminGraphql<{
    tagsAdd: {userErrors: Array<{message: string}>};
  }>(
    env,
    `#graphql
      mutation TagsAdd($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          userErrors { message }
        }
      }
    `,
    {id: customerId, tags},
  );

  const error = data.tagsAdd.userErrors[0]?.message;
  if (error) throw new Error(error);
}

export async function adminTagsRemove(
  env: AdminEnv,
  customerId: string,
  tags: string[],
): Promise<void> {
  if (!tags.length) return;

  const data = await adminGraphql<{
    tagsRemove: {userErrors: Array<{message: string}>};
  }>(
    env,
    `#graphql
      mutation TagsRemove($id: ID!, $tags: [String!]!) {
        tagsRemove(id: $id, tags: $tags) {
          userErrors { message }
        }
      }
    `,
    {id: customerId, tags},
  );

  const error = data.tagsRemove.userErrors[0]?.message;
  if (error) throw new Error(error);
}

export async function adminCustomerUpdateMetafields(
  env: AdminEnv,
  customerId: string,
  metafields: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>,
): Promise<void> {
  if (!metafields.length) return;

  const data = await adminGraphql<{
    customerUpdate: {userErrors: Array<{message: string}>};
  }>(
    env,
    `#graphql
      mutation CustomerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          userErrors { message }
        }
      }
    `,
    {
      input: {
        id: customerId,
        metafields,
      },
    },
  );

  const error = data.customerUpdate.userErrors[0]?.message;
  if (error) throw new Error(error);
}

export async function adminGetCustomerTags(
  env: AdminEnv,
  customerId: string,
): Promise<string[]> {
  const data = await adminGraphql<{
    customer: {tags: string[]} | null;
  }>(
    env,
    `#graphql
      query CustomerTags($id: ID!) {
        customer(id: $id) {
          tags
        }
      }
    `,
    {id: customerId},
  );

  return data.customer?.tags ?? [];
}

export async function applyKycCustomerUpdate(
  env: AdminEnv,
  customerId: string,
  options: {
    status: string;
    sessionId?: string;
    addTags: string[];
    removeTags: string[];
  },
): Promise<void> {
  const uniqueRemove = options.removeTags.filter(
    (tag) => !options.addTags.includes(tag),
  );

  await Promise.all([
    adminTagsRemove(env, customerId, uniqueRemove),
    adminTagsAdd(env, customerId, options.addTags),
  ]);

  const metafields: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }> = [
    {
      namespace: 'custom',
      key: 'kyc_status',
      value: options.status,
      type: 'single_line_text_field',
    },
  ];

  if (options.sessionId) {
    metafields.push({
      namespace: 'custom',
      key: 'didit_session_id',
      value: options.sessionId,
      type: 'single_line_text_field',
    });
  }

  if (options.status === 'Approved') {
    metafields.push({
      namespace: 'custom',
      key: 'kyc_verified_at',
      value: new Date().toISOString().slice(0, 10),
      type: 'date',
    });
  }

  await adminCustomerUpdateMetafields(env, customerId, metafields);
}
