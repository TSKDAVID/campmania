import type {Locale} from '~/lib/trailrent/i18n';
import {getTranslations} from '~/lib/trailrent/i18n';
import {
  resolveStorefrontPath,
  type ResolveStorefrontPathOptions,
} from '~/lib/storefront-url';

export const FALLBACK_PROMO_IMAGE =
  'https://images.unsplash.com/photo-1478131143081-80f7f84b84c7?auto=format&fit=crop&w=2000&q=80';

export const HOMEPAGE_PROMO_METAOBJECT_TYPE = 'homepage_promo_slide';

export type HomepagePromoSlide = {
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  badge?: string;
  ctaLabel: string;
  linkUrl: string;
  imageUrl: string;
  imageAlt?: string;
  sortOrder: number;
};

type MetaobjectField = {
  key: string;
  value?: string | null;
  reference?: {
    image?: {
      url?: string | null;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    } | null;
  } | null;
} | null;

type MetaobjectNode = {
  id: string;
  handle: string;
  fields: MetaobjectField[];
};

export type HomepagePromoSlidesQuery = {
  metaobjects: {
    nodes: MetaobjectNode[];
  };
};

function fieldValue(fields: MetaobjectField[], key: string): string {
  const field = fields.find((entry) => entry?.key === key);
  return field?.value?.trim() ?? '';
}

function fieldImage(fields: MetaobjectField[], key: string) {
  const field = fields.find((entry) => entry?.key === key);
  return field?.reference?.image ?? null;
}

function parseActiveBoolean(value?: string | null): boolean {
  if (value == null) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function isActive(fields: MetaobjectField[]): boolean {
  const field = fields.find((entry) => entry?.key === 'active');
  if (!field) return true;
  return parseActiveBoolean(field.value);
}

function localizedField(
  fields: MetaobjectField[],
  key: string,
  locale: Locale,
): string {
  const localizedKey = locale === 'ka' ? `${key}_ka` : `${key}_en`;
  const localized = fieldValue(fields, localizedKey);
  if (localized) return localized;
  return fieldValue(fields, `${key}_en`) || fieldValue(fields, `${key}_ka`);
}

export function mapMetaobjectToSlide(
  node: MetaobjectNode,
  locale: Locale,
  resolveContext?: ResolveStorefrontPathOptions,
): HomepagePromoSlide | null {
  const fields = node.fields ?? [];
  if (!isActive(fields)) return null;

  const title = localizedField(fields, 'title', locale);
  const subtitle = localizedField(fields, 'subtitle', locale);
  const ctaLabel = localizedField(fields, 'cta_label', locale);
  const rawLinkUrl = fieldValue(fields, 'link_url') || '/collections/all';
  const linkUrl = resolveStorefrontPath(rawLinkUrl, resolveContext).to;

  if (!title) return null;

  const image = fieldImage(fields, 'image');
  const sortOrder = Number.parseInt(fieldValue(fields, 'sort_order'), 10);

  return {
    id: node.id,
    handle: node.handle,
    title,
    subtitle,
    badge: localizedField(fields, 'badge', locale) || undefined,
    ctaLabel: ctaLabel || (locale === 'ka' ? 'კატალოგის ნახვა' : 'Browse catalog'),
    linkUrl,
    imageUrl: image?.url || FALLBACK_PROMO_IMAGE,
    imageAlt: image?.altText || undefined,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

export function parseHomepagePromoSlides(
  data: HomepagePromoSlidesQuery | null | undefined,
  locale: Locale,
  resolveContext?: ResolveStorefrontPathOptions,
): HomepagePromoSlide[] {
  const nodes = data?.metaobjects?.nodes ?? [];

  return nodes
    .map((node) => mapMetaobjectToSlide(node, locale, resolveContext))
    .filter((slide): slide is HomepagePromoSlide => Boolean(slide))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.handle.localeCompare(b.handle));
}

export function getFallbackHomepagePromoSlides(locale: Locale): HomepagePromoSlide[] {
  const tr = getTranslations(locale);

  return [
    {
      id: 'fallback-primary',
      handle: 'fallback-primary',
      title: tr.hero.title,
      subtitle: tr.hero.subtitle,
      badge: tr.home.promoBadge,
      ctaLabel: tr.home.promoCta,
      linkUrl: '/collections/all',
      imageUrl: FALLBACK_PROMO_IMAGE,
      sortOrder: 0,
    },
  ];
}

export const HOMEPAGE_PROMO_SLIDES_QUERY = `#graphql
  query HomepagePromoSlides(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    metaobjects(type: "${HOMEPAGE_PROMO_METAOBJECT_TYPE}", first: 20) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
` as const;
