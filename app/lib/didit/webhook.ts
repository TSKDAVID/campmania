import crypto from 'node:crypto';

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

export type DiditWebhookVerifyResult =
  | {ok: true; parsed: Record<string, unknown>}
  | {ok: false; status: number; message: string};

export function verifyDiditWebhook(
  raw: string,
  headers: Headers,
  secret: string,
): DiditWebhookVerifyResult {
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
  const expected = crypto
    .createHmac('sha256', secret)
    .update(canonical, 'utf8')
    .digest('hex');

  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return {ok: false, status: 401, message: 'bad sig'};
  }

  return {ok: true, parsed};
}
