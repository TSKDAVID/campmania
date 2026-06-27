/** Whole-number floats (1.0) → integers (1), recursively. */
export function shortenFloats(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shortenFloats);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        shortenFloats(entry),
      ]),
    );
  }
  if (
    typeof value === 'number' &&
    !Number.isInteger(value) &&
    value % 1 === 0
  ) {
    return Math.trunc(value);
  }
  return value;
}

/** Recursive lexicographic key sort (array order preserved). */
export function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.keys(value as object)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

export function canonicalWebhookBody(parsed: unknown): string {
  return JSON.stringify(sortKeys(shortenFloats(parsed)));
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message),
  );
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export type DiditWebhookVerifyResult =
  | {ok: true; parsed: Record<string, unknown>}
  | {ok: false; status: number; message: string};

export async function verifyDiditWebhook(
  raw: string,
  headers: Headers,
  secret: string,
): Promise<DiditWebhookVerifyResult> {
  const signature = headers.get('x-signature-v2') ?? '';
  const timestamp = Number(headers.get('x-timestamp'));

  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300) {
    return {ok: false, status: 401, message: 'stale'};
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {ok: false, status: 400, message: 'invalid json'};
  }

  const canonical = canonicalWebhookBody(parsed);
  const expected = await hmacSha256Hex(secret, canonical);

  if (!timingSafeEqualHex(signature, expected)) {
    return {ok: false, status: 401, message: 'bad sig'};
  }

  return {ok: true, parsed};
}
