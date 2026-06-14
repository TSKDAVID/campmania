import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import type {FeaturedProductsQuery} from 'storefrontapi.generated';
import {useLocale} from '~/providers/LocaleProvider';
import {
  IconArrowRight,
  IconMetro,
  IconShield,
  IconStar,
} from '~/components/trailrent/Icons';
import {SectionHeading} from '~/components/trailrent/HomeSections';
import {ProductItem} from '~/components/ProductItem';
import {
  HowItWorksSection,
  CategoryGridSection,
  WhyUsSection,
  ReviewsSection,
  FaqSection,
  CtaSection,
} from '~/components/trailrent/ContentSections';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80';

export async function loader(args: Route.LoaderArgs) {
  const featuredProducts = args.context.storefront
    .query(FEATURED_PRODUCTS_QUERY, {variables: {first: 8}})
    .catch(() => null);

  return {featuredProducts};
}

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Premium Hiking Gear Rental — Tbilisi'},
];

export default function Homepage() {
  const {featuredProducts} = useLoaderData<typeof loader>();

  return (
    <div className="overflow-hidden">
      <HomeHero />
      <TrustStrip />
      <IntentRouterSection />
      <FeaturedProducts products={featuredProducts} />
      <HowItWorksSection />
      <CategoryGridSection />
      <WhyUsSection />
      <ReviewsSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}

function HomeHero() {
  const {translations: tr} = useLocale();

  return (
    <section className="relative min-h-[72vh] overflow-hidden bg-pine text-mist">
      <img
        src={HERO_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-pine via-pine/90 to-pine/55"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-pine/95 via-pine/20 to-pine/40"
        aria-hidden
      />

      <div className="tr-page-width relative flex min-h-[72vh] flex-col justify-center py-14 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="tr-eyebrow mb-5 text-amber">{tr.hero.eyebrow}</p>
            <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.08] text-white drop-shadow-sm md:text-5xl lg:text-6xl">
              {tr.hero.title}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-mist/90 md:text-xl">
              {tr.hero.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/packages"
                className="tr-btn-primary bg-amber text-pine shadow-lg shadow-amber/20 hover:bg-amber/90"
              >
                {tr.hero.ctaPackages}
              </Link>
              <Link to="/individual-gear" className="tr-btn-ghost">
                {tr.hero.ctaGear}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/20 bg-pine/40 p-8 shadow-2xl backdrop-blur-md">
              <p className="tr-eyebrow text-mist/80">
                {tr.brand} · Trusted Tier
              </p>
              <ul className="mt-6 space-y-5">
                <StatRow label={tr.hero.statRating} value="4.9" />
                <StatRow label={tr.hero.statRenters} value="500+" />
                <StatRow label={tr.trust.deposit} value="0 ₾" highlight />
              </ul>
              <div className="mt-8 border-t border-white/15 pt-6">
                <p className="text-sm leading-relaxed text-mist/85">
                  {tr.trust.metroDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
      <span className="text-sm text-mist/80">{label}</span>
      <span
        className={`font-display text-2xl font-bold ${highlight ? 'text-amber' : 'text-white'}`}
      >
        {value}
      </span>
    </li>
  );
}

function TrustStrip() {
  const {translations: tr} = useLocale();
  const items = [
    {key: 'metro' as const, Icon: IconMetro},
    {key: 'deposit' as const, Icon: IconShield},
    {key: 'loyalty' as const, Icon: IconStar},
  ];

  return (
    <section className="border-b border-stone bg-white" aria-label="Trust signals">
      <div className="tr-page-width py-5 md:py-6">
        <div className="grid gap-4 md:grid-cols-3">
          {items.map(({key, Icon}) => (
            <div
              key={key}
              className="flex items-start gap-3 rounded-lg border border-stone/50 bg-mist/30 px-4 py-3.5"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pine text-mist"
                aria-hidden
              >
                <Icon size={18} />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-pine">
                  {tr.trust[key]}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-charcoal/70">
                  {tr.trust[`${key}Desc` as keyof typeof tr.trust]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntentRouterSection() {
  const {translations: tr, locale} = useLocale();

  const cards = [
    {
      to: '/packages',
      num: '01',
      eyebrow: tr.nav.packages,
      title: tr.intent.leftTitle,
      desc: tr.intent.leftDesc,
      cta: tr.hero.ctaPackages,
      accent: 'from-moss/30 via-moss/10 to-stone/20',
    },
    {
      to: '/individual-gear',
      num: '02',
      eyebrow: tr.nav.gear,
      title: tr.intent.rightTitle,
      desc: tr.intent.rightDesc,
      cta: tr.hero.ctaGear,
      accent: 'from-amber/30 via-amber/10 to-stone/20',
    },
  ];

  return (
    <section className="tr-section-tight bg-mist">
      <div className="tr-page-width">
        <SectionHeading
          eyebrow={tr.brand}
          title={locale === 'ka' ? 'აირჩიეთ თქვენი გზა' : 'Choose your path'}
          subtitle={
            locale === 'ka'
              ? 'სრული trail კომპლექტი ან ინდივიდუალური აღჭურვილობა — ორივე მეტროში მიღებით.'
              : 'Complete trail kit or à-la-carte gear — both with metro hub pickup.'
          }
          center
        />
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {cards.map((card) => (
            <Link key={card.to} to={card.to} className="tr-card-elevated group p-0">
              <div
                className={`h-28 bg-gradient-to-br ${card.accent} md:h-32`}
                aria-hidden
              />
              <div className="relative p-5 md:p-6">
                <span className="text-4xl font-bold text-stone/70">{card.num}</span>
                <p className="tr-eyebrow mt-3">{card.eyebrow}</p>
                <h3 className="mt-1.5 font-display text-xl font-semibold text-pine transition group-hover:text-forest md:text-2xl">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                  {card.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-pine/5 px-3.5 py-1.5 text-sm font-semibold text-forest transition group-hover:bg-pine group-hover:text-mist">
                  {card.cta}
                  <IconArrowRight size={14} className="opacity-70" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts({
  products,
}: {
  products: Promise<FeaturedProductsQuery | null>;
}) {
  const {translations: tr} = useLocale();

  return (
    <section className="tr-section bg-white">
      <div className="tr-page-width">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={tr.featured.eyebrow}
            title={tr.featured.title}
            subtitle={tr.featured.subtitle}
          />
          <Link to="/collections/all" className="tr-btn-secondary shrink-0">
            {tr.featured.viewAll}
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="cm-product-grid">
              {Array.from({length: 4}).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-2xl bg-stone/60"
                />
              ))}
            </div>
          }
        >
          <Await resolve={products}>
            {(response) =>
              response?.products.nodes.length ? (
                <div className="cm-product-grid">
                  {response.products.nodes.map((product, index) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      loading={index < 4 ? 'eager' : 'lazy'}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-stone bg-mist/50 px-6 py-12 text-center">
                  <p className="text-charcoal/70">{tr.featured.empty}</p>
                  <Link to="/collections/all" className="tr-btn-primary mt-6 inline-flex">
                    {tr.featured.viewAll}
                  </Link>
                </div>
              )
            }
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

const FEATURED_PRODUCT_FRAGMENT = `#graphql
  fragment FeaturedProduct on Product {
    id
    title
    handle
    featuredImage {
      id
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
  }
` as const;

const FEATURED_PRODUCTS_QUERY = `#graphql
  query FeaturedProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int!
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        ...FeaturedProduct
      }
    }
  }
  ${FEATURED_PRODUCT_FRAGMENT}
` as const;
