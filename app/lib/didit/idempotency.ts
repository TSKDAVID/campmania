const CACHE_NAME = 'didit-webhook-idempotency';
const TTL_SECONDS = 60 * 60 * 24 * 7;

async function idempotencyCache(): Promise<Cache> {
  return caches.open(CACHE_NAME);
}

export async function isDiditEventProcessed(eventId: string): Promise<boolean> {
  if (!eventId) return false;
  const cache = await idempotencyCache();
  const hit = await cache.match(
    new Request(`https://didit-idempotency.local/${encodeURIComponent(eventId)}`),
  );
  return hit !== undefined;
}

export async function markDiditEventProcessed(eventId: string): Promise<void> {
  if (!eventId) return;
  const cache = await idempotencyCache();
  const key = new Request(
    `https://didit-idempotency.local/${encodeURIComponent(eventId)}`,
  );
  await cache.put(
    key,
    new Response('1', {
      headers: {
        'Cache-Control': `max-age=${TTL_SECONDS}`,
      },
    }),
  );
}
