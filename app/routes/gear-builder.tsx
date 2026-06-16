import {data, redirect, useFetcher, useLoaderData} from 'react-router';
import type {Route} from './+types/gear-builder';
import {useEffect, useMemo, useState} from 'react';
import {CartForm} from '@shopify/hydrogen';
import {useLocale} from '~/providers/LocaleProvider';
import {useGearBuilder} from '~/providers/GearBuilderProvider';
import {
  buildGearBuilderCartLines,
  calculateBundlePricing,
  groupGearByType,
  type GearItemType,
} from '~/lib/trailrent/gear-builder';
import {
  GearBuilderStrip,
  GearOptionGrid,
  gearTypeLabel,
} from '~/components/trailrent/GearBuilderPanel';
import {loadShopifyGear} from '~/lib/trailrent/shopify-catalog';
import {getLocaleFromRequest} from '~/providers/LocaleProvider';
import {
  parseGearBuilderState,
  readGearBuilderFromSession,
  writeGearBuilderToSession,
} from '~/lib/trailrent/gear-builder/storage';
import {IconCart} from '~/components/trailrent/Icons';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {isGearBuilderEnabled} from '~/lib/trailrent/feature-flags';

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Gear Builder'},
];

export async function loader({context, request}: Route.LoaderArgs) {
  if (!isGearBuilderEnabled(context.env)) {
    throw new Response(null, {status: 404});
  }

  const locale = getLocaleFromRequest(request);
  const gear = await loadShopifyGear(context.storefront, locale).catch(() => []);
  const isLoggedIn = await context.customerAccount.isLoggedIn();
  let customerId: string | null = null;

  if (isLoggedIn) {
    const {data: customerData} = await context.customerAccount.query(
      CUSTOMER_DETAILS_QUERY,
      {
        variables: {language: context.customerAccount.i18n.language},
      },
    );
    customerId = customerData?.customer?.id ?? null;
  }

  const sessionState = readGearBuilderFromSession(context.session, customerId);

  return {
    gear,
    sessionState,
    isLoggedIn,
    customerId,
  };
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '');
  const isLoggedIn = await context.customerAccount.isLoggedIn();
  let customerId: string | null = null;

  if (isLoggedIn) {
    const {data: customerData} = await context.customerAccount.query(
      CUSTOMER_DETAILS_QUERY,
      {
        variables: {language: context.customerAccount.i18n.language},
      },
    );
    customerId = customerData?.customer?.id ?? null;
  }

  if (intent === 'clear') {
    writeGearBuilderToSession(context.session, null, customerId);
    return data({ok: true, cleared: true});
  }

  if (intent === 'save') {
    const raw = String(formData.get('state') ?? '');
    const parsed = parseGearBuilderState(JSON.parse(raw));
    if (!parsed) {
      return data({ok: false, error: 'Invalid builder state'}, {status: 400});
    }
    writeGearBuilderToSession(context.session, parsed, customerId);
    return data({ok: true, saved: true});
  }

  return redirect('/gear-builder');
}

export default function GearBuilderPage() {
  const {gear, sessionState, isLoggedIn} = useLoaderData<typeof loader>();
  const {translations: tr, locale} = useLocale();
  const fetcher = useFetcher<typeof action>();
  const builder = useGearBuilder();
  const [activeType, setActiveType] = useState<GearItemType | null>(null);

  useEffect(() => {
    if (builder.state.slots.length || !sessionState?.slots.length) return;
    builder.replaceState(sessionState);
  }, [builder, sessionState]);

  useEffect(() => {
    if (fetcher.data && 'cleared' in fetcher.data && fetcher.data.cleared) {
      builder.clearAll();
    }
  }, [fetcher.data, builder]);

  const grouped = useMemo(
    () => groupGearByType(gear.map((item) => item.builderProduct)),
    [gear],
  );

  const slots = builder.state.slots.length
    ? builder.state.slots
    : (sessionState?.slots ?? []);

  const subtotalDaily = slots.reduce((sum, slot) => sum + (slot.dailyRate ?? 0), 0);
  const pricing = calculateBundlePricing(subtotalDaily, 1);
  const cartLines = buildGearBuilderCartLines(slots);

  const activeProducts = activeType ? grouped[activeType] ?? [] : [];

  return (
    <section className="cm-gear-builder-page bg-mist">
      <div className="tr-page-width cm-gear-builder-page-inner">
        <header className="cm-gear-builder-header">
          <p className="tr-eyebrow">{tr.gearBuilder.eyebrow}</p>
          <h1 className="cm-gear-builder-title">{tr.gearBuilder.title}</h1>
          <p className="cm-gear-builder-subtitle">{tr.gearBuilder.subtitle}</p>
        </header>

        <GearBuilderStrip
          slots={slots}
          locale={locale}
          activeType={activeType}
          onSelectType={setActiveType}
          onAddType={(type) => {
            builder.addItemType(type);
            setActiveType(type);
          }}
        />

        <div className="cm-gear-builder-toolbar">
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="clear" />
            <button type="submit" className="tr-btn-secondary">
              {tr.gearBuilder.clearAll}
            </button>
          </fetcher.Form>
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="save" />
            <input
              type="hidden"
              name="state"
              value={JSON.stringify(builder.state)}
            />
            <button type="submit" className="tr-btn-secondary">
              {isLoggedIn ? tr.gearBuilder.saveGear : tr.gearBuilder.saveSession}
            </button>
          </fetcher.Form>
          {fetcher.data && 'saved' in fetcher.data && fetcher.data.saved ? (
            <p className="text-sm font-medium text-moss">{tr.gearBuilder.saved}</p>
          ) : null}
        </div>

        <div className="cm-gear-builder-layout">
          <div className="cm-gear-builder-main">
            {activeType ? (
              <>
                <h2 className="cm-gear-builder-section-title">
                  {gearTypeLabel(activeType, locale)}
                </h2>
                <GearOptionGrid
                  products={activeProducts}
                  locale={locale}
                  onSelect={(product, variantId) => {
                    builder.setSlotProduct(activeType, product, variantId);
                  }}
                />
              </>
            ) : (
              <p className="cm-gear-builder-hint">{tr.gearBuilder.pickSlotHint}</p>
            )}
          </div>

          <aside className="cm-gear-builder-summary">
            <h2 className="cm-gear-builder-section-title">{tr.booking.total}</h2>
            <div className="cm-gear-builder-summary-row">
              <span>{tr.booking.dailyRate}</span>
              <span>{pricing.bundleDailyLabel}</span>
            </div>
            <p className="cm-gear-builder-discount">
              -{pricing.discountPercent}% {tr.gearBuilder.bundleDiscount}
            </p>
            <ul className="cm-gear-builder-summary-list">
              {slots.map((slot) => (
                <li key={slot.itemType}>
                  {slot.title ?? gearTypeLabel(slot.itemType, locale)}
                </li>
              ))}
            </ul>
            <CartForm
              route="/cart"
              inputs={{lines: cartLines}}
              action={CartForm.ACTIONS.LinesAdd}
            >
              {(cartFetcher) => (
                <button
                  type="submit"
                  className="tr-btn-primary w-full"
                  disabled={!cartLines.length || cartFetcher.state !== 'idle'}
                >
                  <IconCart size={18} />
                  {tr.gearBuilder.addBundleToCart}
                </button>
              )}
            </CartForm>
          </aside>
        </div>
      </div>
    </section>
  );
}
