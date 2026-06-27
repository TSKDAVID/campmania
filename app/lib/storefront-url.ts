export type ResolveStorefrontPathOptions = {
  /** e.g. campmania.myshopify.com */
  storeDomain?: string;
  /** e.g. https://campmania.ge */
  primaryDomainUrl?: string;
  /** Current request or window hostname */
  requestHost?: string;
};

export type ResolvedStorefrontPath = {
  to: string;
  external: boolean;
};

function normalizeHost(value?: string): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      return new URL(trimmed).hostname.toLowerCase();
    }
  } catch {
    return null;
  }

  return trimmed
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    ?.split(':')[0]
    ?? null;
}

function collectKnownHosts(options: ResolveStorefrontPathOptions): Set<string> {
  const hosts = new Set<string>();

  for (const candidate of [
    options.storeDomain,
    options.primaryDomainUrl,
    options.requestHost,
  ]) {
    const host = normalizeHost(candidate);
    if (host) hosts.add(host);
  }

  return hosts;
}

function hostMatchesKnown(host: string, knownHosts: Set<string>): boolean {
  if (knownHosts.has(host)) return true;

  if (host.startsWith('www.')) {
    return knownHosts.has(host.slice(4));
  }

  return knownHosts.has(`www.${host}`);
}

function isShopifyStoreHost(host: string): boolean {
  return host.endsWith('.myshopify.com');
}

export function resolveStorefrontPath(
  url: string,
  options: ResolveStorefrontPathOptions = {},
): ResolvedStorefrontPath {
  const trimmed = url.trim();
  if (!trimmed) {
    return {to: '/collections/all', external: false};
  }

  if (trimmed.startsWith('//')) {
    return resolveStorefrontPath(`https:${trimmed}`, options);
  }

  if (trimmed.startsWith('/')) {
    return {to: trimmed, external: false};
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return {to: `/${trimmed.replace(/^\/+/, '')}`, external: false};
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {to: '/collections/all', external: false};
  }

  const path = `${parsed.pathname}${parsed.search}${parsed.hash}` || '/';
  const host = parsed.hostname.toLowerCase();
  const knownHosts = collectKnownHosts(options);

  if (
    isShopifyStoreHost(host) ||
    hostMatchesKnown(host, knownHosts)
  ) {
    return {to: path, external: false};
  }

  return {to: trimmed, external: true};
}
