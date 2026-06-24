import {useMemo, useState} from 'react';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductImage, type GalleryImage} from '~/components/ProductImage';
import {
  RentalProductForm,
  type FulfillmentMode,
} from '~/components/RentalProductForm';
import {INCLUSION_PRODUCT_FRAGMENT} from '~/graphql/storefront/CatalogProductsQuery';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  COLLECTION_PRODUCTS_QUERY,
  mapCatalogNodeToGearBuilderProduct,
  resolveIncludedKitNodes,
  resolvePackagePricingFromCatalog,
  type CatalogProductNode,
} from '~/lib/trailrent/shopify-catalog';
import {liveStorefrontCache} from '~/lib/trailrent/storefront-live';
import type {PackageDuration} from '~/lib/trailrent/gear-builder';
import {
  ProductDescription,
  ProductIncludedPanel,
  type ProductIncludedItem,
  ProductInlinePrice,
  ProductPricingExtras,
  ProductTechnicalSpecs,
  ProductTrustBar,
} from '~/components/trailrent/ProductPageSections';
import {AddToGearBuilderButton} from '~/components/trailrent/AddToGearBuilderButton';
import {useLocale} from '~/providers/LocaleProvider';
import {loadCustomerRentalContext} from '~/lib/trailrent/customer-rental-context';
import {buildRentToOwnOffer} from '~/lib/trailrent/rent-to-own';
import {isTrustedTier} from '~/lib/trailrent/loyalty';
import {
  collectProductVariants,
  coalesceMetafieldValue,
  metafieldValueByKeys,
  packageBuyAvailable,
  resolveFulfillmentVariants,
  sumPackagePurchasePrice,
} from '~/lib/trailrent/product-variants';
import {
  capacityFromVariantTitle,
  parseGearBuilderMetafields,
  type GearBuilderProduct,
} from '~/lib/trailrent/gear-builder';
import {isGearBuilderEnabled} from '~/lib/trailrent/feature-flags';

/** Fallback handles when demo vs live Shopify handles differ. */
const PRODUCT_HANDLE_FALLBACKS: Record<string, string[]> = {
  'birtvisi-package': ['birtvisi-day-hike-kit'],
  'birtvisi-day-hike-kit': ['birtvisi-package'],
  'tobavarchkhili-weekend-kit': ['tobavarchkhili-package'],
  'kazbegi-alpine-kit': ['kazbegi-package'],
};

async function queryProductByHandle(
  storefront: Route.LoaderArgs['context']['storefront'],
  handle: string,
  request: Request,
) {
  return storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    ...liveStorefrontCache(storefront),
  });
}

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Campmania | ${data?.product.title ?? 'Product'}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const [criticalData, customerRentalContext] = await Promise.all([
    loadCriticalData(args),
    loadCustomerRentalContext(args.context),
  ]);

  return {
    ...criticalData,
    customerRentalContext,
    gearBuilderEnabled: isGearBuilderEnabled(args.context.env),
  };
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product: initialProduct}] = await Promise.all([
    queryProductByHandle(storefront, handle, request),
  ]);

  let product = initialProduct;
  let resolvedHandle = handle;

  if (!product?.id) {
    const fallbacks = PRODUCT_HANDLE_FALLBACKS[handle] ?? [];
    for (const alt of fallbacks) {
      const {product: altProduct} = await queryProductByHandle(
        storefront,
        alt,
        request,
      );
      if (altProduct?.id) {
        product = altProduct;
        resolvedHandle = alt;
        break;
      }
    }
  }

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: resolvedHandle, data: product});

  const includedKitProducts = await resolveIncludedKitNodes(
    storefront,
    product,
    resolvedHandle,
  );
  const includedItems = includedKitProducts.length
    ? includedKitProducts.map((node) => node.title)
    : await resolveIncludedItemTitles(storefront, product, resolvedHandle);
  const packagePricing = await resolvePackagePricingForProduct(
    storefront,
    product,
    resolvedHandle,
    includedKitProducts,
  );

  return {product, includedItems, includedKitProducts, packagePricing};
}

async function resolvePackagePricingForProduct(
  storefront: Route.LoaderArgs['context']['storefront'],
  product: {
    tags?: string[];
    includedCollection?: {
      reference?: {
        products?: {nodes?: Array<Record<string, unknown>> | null} | null;
      } | null;
    } | null;
  },
  handle: string,
  includedKitProducts?: Array<Record<string, unknown>>,
) {
  const isPackage = (product.tags ?? []).some((tag: string) =>
    tag.startsWith('trek-'),
  );
  if (!isPackage) return null;

  let nodes = includedKitProducts ?? [];
  if (!nodes.length) {
    nodes = (await resolveIncludedKitNodes(
      storefront,
      product as never,
      handle,
    )) as never;
  }
  if (!nodes.length) return null;

  const durationTag = (product.tags ?? []).find((tag: string) =>
    tag.startsWith('duration-'),
  );
  const duration = (durationTag?.slice('duration-'.length) ??
    '2-day') as PackageDuration;

  return resolvePackagePricingFromCatalog(nodes as never, duration);
}

async function resolveIncludedItemTitles(
  storefront: Route.LoaderArgs['context']['storefront'],
  product: CatalogProductNode & {tags?: string[]},
  handle: string,
): Promise<string[]> {
  const kitNodes = await resolveIncludedKitNodes(storefront, product, handle);
  if (kitNodes.length > 0) {
    return kitNodes.map((node) => node.title);
  }

  return parseIncludedItems(product.includedItems);
}

function parseIncludedItems(metafield?: {value: string; type: string} | null): string[] {
  if (!metafield?.value) return [];
  try {
    const parsed = JSON.parse(metafield.value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    // fall through — treat as newline list
  }
  return metafield.value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function Product() {
  const {
    product,
    includedItems,
    includedKitProducts,
    packagePricing,
    customerRentalContext,
    gearBuilderEnabled,
  } = useLoaderData<typeof loader>();
  const {locale, translations: tr} = useLocale();
  const [fulfillmentMode, setFulfillmentMode] =
    useState<FulfillmentMode>('rent');

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const {title, descriptionHtml, id: productId, tags = []} = product;
  const isSoloProduct = includedItems.length === 0;
  const isPackage =
    includedItems.length > 0 || tags.some((t: string) => t.startsWith('trek-'));

  const fulfillment = useMemo(() => {
    const variants = collectProductVariants(product);
    const availableMeta = coalesceMetafieldValue(
      metafieldValueByKeys(product.fulfillmentMetafields, [
        'available-to-purchase',
        'available_for_purchase',
      ]),
      product.availableForPurchase?.value,
      product.availableForPurchaseAlt?.value,
    );
    const purchaseMeta = coalesceMetafieldValue(
      metafieldValueByKeys(product.fulfillmentMetafields, [
        'purchase-price',
        'purchase_price',
      ]),
      product.purchasePriceMeta?.value,
      product.purchasePriceMetaAlt?.value,
    );

    return resolveFulfillmentVariants({
      variants,
      availableForPurchaseMeta: availableMeta,
      purchasePriceMeta: purchaseMeta,
    });
  }, [product]);

  const rentVariant = fulfillment?.rentVariant;
  const buyVariant = fulfillment?.buyVariant;
  const buyCheckoutReady = fulfillment?.buyCheckoutReady ?? false;
  const dailyRate = Number(rentVariant?.price?.amount ?? 0);
  const displayDailyRate = packagePricing?.bundleDaily ?? dailyRate;
  let purchasePrice = fulfillment?.purchasePrice ?? 0;
  const compareAt = Number(rentVariant?.compareAtPrice?.amount ?? 0);
  const displayCompareAt = packagePricing?.subtotalDaily ?? compareAt;
  if (!isPackage && purchasePrice <= 0 && compareAt > dailyRate) {
    purchasePrice = compareAt;
  }
  const buyAvailableRaw =
    (fulfillment?.buyAvailable ?? false) ||
    (purchasePrice > dailyRate && compareAt > dailyRate);
  const kitBuyAvailable =
    isPackage && includedKitProducts.length > 0
      ? packageBuyAvailable(includedKitProducts)
      : false;
  const buyAvailable = isPackage ? kitBuyAvailable : buyAvailableRaw;
  if (isPackage && kitBuyAvailable) {
    purchasePrice = sumPackagePurchasePrice(includedKitProducts);
  }
  const buyPriceMoney: MoneyV2 | undefined =
    purchasePrice > 0
      ? {
          amount: String(purchasePrice),
          currencyCode:
            (buyVariant?.price.currencyCode ??
              rentVariant?.price.currencyCode ??
              'GEL') as MoneyV2['currencyCode'],
        }
      : undefined;

  const kitSummary = product.kitSummary?.value?.trim();
  const productSubtitle = kitSummary || product.description?.trim();
  const savingsPercent =
    !buyAvailable &&
    displayCompareAt > displayDailyRate &&
    displayCompareAt > 0
      ? Math.round(((displayCompareAt - displayDailyRate) / displayCompareAt) * 100)
      : packagePricing?.discountPercent;
  const displayRentPrice: MoneyV2 | undefined =
    displayDailyRate > 0
      ? {
          amount: String(displayDailyRate),
          currencyCode:
            (rentVariant?.price.currencyCode ?? 'GEL') as MoneyV2['currencyCode'],
        }
      : (rentVariant?.price as MoneyV2 | undefined);
  const displayCompareAtPrice: MoneyV2 | null | undefined =
    displayCompareAt > displayDailyRate
      ? {
          amount: String(displayCompareAt),
          currencyCode:
            (rentVariant?.compareAtPrice?.currencyCode ??
              rentVariant?.price.currencyCode ??
              'GEL') as MoneyV2['currencyCode'],
        }
      : (rentVariant?.compareAtPrice as MoneyV2 | null | undefined);

  const trustedTier = isTrustedTier(customerRentalContext.tags);
  const rentToOwnOffer = buildRentToOwnOffer({
    productId,
    purchasePrice,
    orders: customerRentalContext.orders,
  });

  const bookingFormProps = rentVariant?.id
    ? {
        rentVariantId: rentVariant.id,
        buyVariantId: buyVariant?.id,
        buyAvailable,
        buyCheckoutReady,
        productTitle: title,
        dailyRate: displayDailyRate,
        compareAtDailyRate:
          displayCompareAt > displayDailyRate ? displayCompareAt : undefined,
        purchasePrice,
        rentToOwnOffer,
        isTrustedTier: trustedTier,
        onModeChange: setFulfillmentMode,
      }
    : null;

  const builderProduct = useMemo((): GearBuilderProduct | null => {
    if (!gearBuilderEnabled || isPackage) return null;
    const variants = (product.variants?.nodes ?? []).map(
      (entry: NonNullable<typeof product.variants>['nodes'][number]) => ({
      id: entry.id,
      title: entry.title ?? '',
      availableForSale: entry.availableForSale !== false,
      price: Number(entry.price.amount),
      capacityLiters: capacityFromVariantTitle(entry.title ?? ''),
      }),
    );
    const metafields = parseGearBuilderMetafields({
      itemType: product.gearItemType?.value,
      builderEnabled: product.gearBuilderEnabled?.value,
      capacityLiters: product.gearCapacityLiters?.value,
      capacityClass: product.gearCapacityClass?.value,
      durationFit: product.gearDurationFit?.value,
      thumbnailPriority: product.gearThumbnailPriority?.value,
    });
    const category = tags.find((t: string) => t.startsWith('gear-'))?.slice(5);
    if (!product.gearBuilderEnabled?.value && !product.gearItemType?.value && category) {
      metafields.itemType =
        category === 'sleeping'
          ? 'sleeping_bag'
          : category === 'electronics'
            ? 'lighting'
            : (category as GearBuilderProduct['metafields']['itemType']);
      metafields.builderEnabled = true;
    }
    return {
      id: product.id,
      handle: product.handle,
      title,
      imageUrl: selectedVariant?.image?.url ?? rentVariant?.image?.url,
      dailyRate,
      variantId: rentVariant?.id,
      availableForSale: rentVariant?.availableForSale !== false,
      metafields,
      variants,
    };
  }, [gearBuilderEnabled, isPackage, product, tags, title, dailyRate, rentVariant, selectedVariant]);

  const includedProducts = useMemo((): ProductIncludedItem[] => {
    if (!includedKitProducts.length) return [];
    return includedKitProducts.map((node) => {
      const product = mapCatalogNodeToGearBuilderProduct(
        node as Parameters<typeof mapCatalogNodeToGearBuilderProduct>[0],
      );
      return {
        title: product.title,
        handle: product.handle,
        imageUrl: product.imageUrl,
        dailyRate: product.dailyRate,
      };
    });
  }, [includedKitProducts]);

  const galleryImages = useMemo((): GalleryImage[] => {
    const fromMedia = (product.media?.nodes ?? [])
      .map((node: {
        id: string;
        image?: {
          id: string;
          url: string;
          altText?: string | null;
          width?: number | null;
          height?: number | null;
        } | null;
      }) => {
        if (!node.image?.url) return null;
        return {
          id: node.id,
          url: node.image.url,
          altText: node.image.altText,
          width: node.image.width,
          height: node.image.height,
        };
      })
      .filter((entry: GalleryImage | null): entry is GalleryImage => entry != null);

    if (fromMedia.length) return fromMedia;

    const fallback = selectedVariant?.image ?? rentVariant?.image;
    if (!fallback) return [];

    return [
      {
        id: fallback.id ?? fallback.url,
        url: fallback.url,
        altText: fallback.altText,
        width: fallback.width,
        height: fallback.height,
      },
    ];
  }, [product.media?.nodes, rentVariant?.image, selectedVariant?.image]);

  return (
    <article className="cm-pdp">
      <div className="cm-pdp__grid">
        <div className="cm-pdp__gallery" aria-label={title}>
          <ProductImage
            images={galleryImages}
            image={selectedVariant?.image ?? rentVariant?.image}
            title={title}
            variant={isSoloProduct ? 'solo' : 'kit'}
          />
        </div>

        <div className="cm-pdp__panel">
          <header>
            <p className="text-xs text-muted" style={{textTransform: 'uppercase', letterSpacing: '0.08em'}}>
              {isPackage ? tr.packages.eyebrow : tr.product.rental}
            </p>
            <h1 className="cm-pdp__title">{title}</h1>
            {productSubtitle ? (
              <p className="text-sm text-muted" style={{marginTop: 'var(--space-1)'}}>{productSubtitle}</p>
            ) : null}
            <div className="cm-pdp__price">
              <ProductInlinePrice
                fulfillmentMode={fulfillmentMode}
                rentPrice={displayRentPrice}
                buyPrice={buyPriceMoney}
                buyAvailable={buyAvailable}
                compareAtPrice={displayCompareAtPrice}
              />
              <ProductPricingExtras
                fulfillmentMode={fulfillmentMode}
                rentPrice={displayRentPrice}
                compareAtPrice={displayCompareAtPrice}
                savingsPercent={savingsPercent}
                buyAvailable={buyAvailable}
                variant="inline"
              />
            </div>
          </header>

          <ProductTrustBar isTrustedTier={trustedTier} />

          {includedItems.length > 0 ? (
            <ProductIncludedPanel
              items={includedItems}
              includedProducts={includedProducts}
              variant="editorial"
            />
          ) : null}

          {bookingFormProps ? (
            <div>
              <RentalProductForm
                {...bookingFormProps}
                layout={isPackage ? 'stacked' : 'wide'}
                compact
              />
              {builderProduct ? (
                <AddToGearBuilderButton
                  product={builderProduct}
                  variantId={rentVariant?.id}
                />
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">
              {locale === 'ka'
                ? 'ეს ვარიანტი ამჟამად მიუწვდომელია.'
                : 'This variant is currently unavailable.'}
            </p>
          )}
        </div>
      </div>

      {descriptionHtml?.trim() ? (
        <div className="cm-container" style={{paddingTop: 'var(--space-5)', paddingBottom: 'var(--space-5)'}}>
          <ProductTechnicalSpecs html={descriptionHtml} />
        </div>
      ) : null}

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: rentVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: rentVariant?.id || '',
              variantTitle: rentVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </article>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    variants(first: 25) {
      nodes {
        ...ProductVariant
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    tags
    includedItems: metafield(namespace: "custom", key: "included_items") {
      value
      type
    }
    includedCollection: metafield(namespace: "custom", key: "included_collection") {
      value
      reference {
        ... on Collection {
          handle
          products(first: 25) {
            nodes {
              ...InclusionProduct
            }
          }
        }
      }
    }
    kitSummary: metafield(namespace: "custom", key: "kit_summary") {
      value
    }
    availableForPurchase: metafield(namespace: "custom", key: "available-to-purchase") {
      value
    }
    availableForPurchaseAlt: metafield(namespace: "custom", key: "available_for_purchase") {
      value
    }
    purchasePriceMeta: metafield(namespace: "custom", key: "purchase-price") {
      value
    }
    purchasePriceMetaAlt: metafield(namespace: "custom", key: "purchase_price") {
      value
    }
    fulfillmentMetafields: metafields(
      identifiers: [
        {namespace: "custom", key: "available-to-purchase"},
        {namespace: "custom", key: "available_for_purchase"},
        {namespace: "custom", key: "purchase-price"},
        {namespace: "custom", key: "purchase_price"},
      ]
    ) {
      key
      value
      type
    }
    gearItemType: metafield(namespace: "gear_builder", key: "item_type") {
      value
    }
    gearBuilderEnabled: metafield(namespace: "gear_builder", key: "builder_enabled") {
      value
    }
    gearCapacityLiters: metafield(namespace: "gear_builder", key: "capacity_liters") {
      value
    }
    gearCapacityClass: metafield(namespace: "gear_builder", key: "capacity_class") {
      value
    }
    gearDurationFit: metafield(namespace: "gear_builder", key: "duration_fit") {
      value
    }
    gearThumbnailPriority: metafield(namespace: "gear_builder", key: "thumbnail_priority") {
      value
    }
    media(first: 20) {
      nodes {
        ... on MediaImage {
          id
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
  }
` as const;

const STRIP_GRAPHQL_TAG = (fragment: string) =>
  fragment.replace(/^#graphql\s*\n?/, '');

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
  ${STRIP_GRAPHQL_TAG(INCLUSION_PRODUCT_FRAGMENT)}
  ${PRODUCT_FRAGMENT}
` as const;
