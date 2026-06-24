import {data, redirect, useFetcher, useLoaderData, useNavigate, useSearchParams} from 'react-router';
import type {Route} from './+types/gear-builder';
import {useEffect, useMemo, useRef, useState} from 'react';
import {CartForm} from '@shopify/hydrogen';
import {useLocale} from '~/providers/LocaleProvider';
import {useGearBuilder} from '~/providers/GearBuilderProvider';
import {
  buildGearBuilderCartLines,
  calculateBundlePricing,
  enrichGearBuilderSlots,
  groupGearByType,
  slotsNeedCatalogEnrichment,
  type GearItemType,
} from '~/lib/trailrent/gear-builder';
import {
  GearBuilderStrip,
  GearOptionGrid,
  GearTypeIcon,
  gearTypeLabel,
} from '~/components/trailrent/GearBuilderPanel';
import {GearBuilderSaveDialog} from '~/components/trailrent/GearBuilderSaveDialog';
import {loadShopifyGear} from '~/lib/trailrent/shopify-catalog';
import {getCartActionErrorMessage} from '~/lib/trailrent/cart-display';
import {getLocaleFromRequest} from '~/providers/LocaleProvider';
import {TREK_FILTERS} from '~/lib/trailrent/catalog';
import {
  createBuildId,
  findSavedBuild,
  mergeGuestGearBuilderLibrary,
  parseGearBuilderState,
  readGearBuilderLibrary,
  upsertSavedBuild,
  writeGearBuilderLibrary,
} from '~/lib/trailrent/gear-builder/storage';
import {
  IconCart,
  IconCheck,
  IconLayers,
  IconSave,
  IconTrash,
} from '~/components/trailrent/Icons';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {isGearBuilderEnabled} from '~/lib/trailrent/feature-flags';
import {GEAR_BUILDER_MAX_SAVED_BUILDS, GEAR_BUILDER_MIN_SAVE_ITEMS} from '~/lib/trailrent/gear-builder/types';

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Gear Builder'},
];

export function shouldRevalidate() {
  return true;
}

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

  const library = readGearBuilderLibrary(context.session, customerId);
  const mergedLibrary = customerId
    ? mergeGuestGearBuilderLibrary(context.session, library, customerId)
    : library;
  if (mergedLibrary !== library && customerId) {
    writeGearBuilderLibrary(context.session, mergedLibrary, customerId);
  }

  const url = new URL(request.url);
  const buildId = url.searchParams.get('build');
  const loadedBuildRaw = buildId ? findSavedBuild(mergedLibrary, buildId) : null;
  const catalogProducts = gear.map((item) => item.builderProduct);
  const loadedBuild = loadedBuildRaw
    ? {
        ...loadedBuildRaw,
        slots: enrichGearBuilderSlots(loadedBuildRaw.slots, catalogProducts),
      }
    : null;

  return {
    gear,
    library: mergedLibrary,
    loadedBuild,
    isLoggedIn,
    customerId,
  };
}

async function resolveGearBuilderCustomerId(
  context: Route.ActionArgs['context'],
): Promise<string | null> {
  try {
    const isLoggedIn = await context.customerAccount.isLoggedIn();
    if (!isLoggedIn) return null;

    const {data: customerData} = await context.customerAccount.query(
      CUSTOMER_DETAILS_QUERY,
      {
        variables: {language: context.customerAccount.i18n.language},
      },
    );
    return customerData?.customer?.id ?? null;
  } catch (error) {
    console.error('gear-builder: customer lookup failed', error);
    return null;
  }
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '');

  if (intent === 'save') {
    const customerId = await resolveGearBuilderCustomerId(context);
    const raw = String(formData.get('state') ?? '');
    const name = String(formData.get('name') ?? '').trim();
    const trek = String(formData.get('trek') ?? '').trim() || undefined;
    const buildId = String(formData.get('buildId') ?? '').trim() || undefined;
    const saveAsNew = formData.get('saveAsNew') === 'true';

    let parsed;
    try {
      parsed = parseGearBuilderState(JSON.parse(raw));
    } catch (error) {
      console.error('gear-builder: invalid save payload', error);
      return data({ok: false, error: 'invalid_state'}, {status: 400});
    }

    if (!parsed) {
      return data({ok: false, error: 'invalid_state'}, {status: 400});
    }
    if (!parsed.slots.some((slot) => slot.productId)) {
      return data({ok: false, error: 'empty_state'}, {status: 400});
    }
    const filledCount = parsed.slots.filter((slot) => slot.productId).length;
    if (filledCount < GEAR_BUILDER_MIN_SAVE_ITEMS) {
      return data({ok: false, error: 'min_items'}, {status: 400});
    }
    if (!name) {
      return data({ok: false, error: 'name_required'}, {status: 400});
    }

    let library = readGearBuilderLibrary(context.session, customerId);
    if (customerId) {
      library = mergeGuestGearBuilderLibrary(context.session, library, customerId);
    }

    const id = saveAsNew || !buildId ? createBuildId() : buildId;
    const {library: nextLibrary, error} = upsertSavedBuild(library, {
      id,
      name,
      trek,
      slots: parsed.slots,
      updatedAt: new Date().toISOString(),
    });

    if (error === 'max_builds') {
      return data({ok: false, error: 'max_builds'}, {status: 400});
    }

    try {
      writeGearBuilderLibrary(context.session, nextLibrary, customerId);
    } catch (error) {
      console.error('gear-builder: session write failed', error);
      return data({ok: false, error: 'save_failed'}, {status: 500});
    }

    return data({ok: true, saved: true, buildId: id});
  }

  return redirect('/gear-builder');
}

export default function GearBuilderPage() {
  const {gear, loadedBuild, isLoggedIn} = useLoaderData<typeof loader>();
  const {translations: tr, locale} = useLocale();
  const fetcher = useFetcher<typeof action>();
  const builder = useGearBuilder();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeType, setActiveType] = useState<GearItemType | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [buildName, setBuildName] = useState('');
  const [buildTrek, setBuildTrek] = useState('');
  const [hydratedBuildId, setHydratedBuildId] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState(false);
  const lastHandledSave = useRef<unknown>(null);
  const buildNameRef = useRef(buildName);
  const buildTrekRef = useRef(buildTrek);
  buildNameRef.current = buildName;
  buildTrekRef.current = buildTrek;

  const trekOptions = TREK_FILTERS.map((trek) => ({
    value: trek.value,
    label: locale === 'ka' ? trek.labelKa : trek.labelEn,
  }));

  useEffect(() => {
    if (searchParams.get('new') !== '1') return;

    builder.clearAll();
    setActiveType(null);
    setBuildName('');
    setBuildTrek('');
    setSaveOpen(false);
    setSaveNotice(false);
    setSaveAsNew(false);
    setHydratedBuildId(null);
    navigate('/gear-builder', {replace: true});
  }, [searchParams, builder, navigate]);

  useEffect(() => {
    const currentBuildId = searchParams.get('build');
    if (!currentBuildId || !loadedBuild || hydratedBuildId === currentBuildId) return;

    builder.replaceState({
      version: 1,
      slots: loadedBuild.slots,
      updatedAt: loadedBuild.updatedAt,
      buildId: loadedBuild.id,
      name: loadedBuild.name,
      trek: loadedBuild.trek,
    });
    setBuildName(loadedBuild.name);
    setBuildTrek(loadedBuild.trek ?? '');
    setHydratedBuildId(currentBuildId);
  }, [loadedBuild, builder, searchParams, hydratedBuildId]);

  const catalogProducts = useMemo(
    () => gear.map((item) => item.builderProduct),
    [gear],
  );

  useEffect(() => {
    if (!catalogProducts.length) return;
    if (!slotsNeedCatalogEnrichment(builder.state.slots)) return;

    const enriched = enrichGearBuilderSlots(
      builder.state.slots,
      catalogProducts,
    );
    const changed = enriched.some(
      (slot, index) => slot.imageUrl !== builder.state.slots[index]?.imageUrl,
    );
    if (!changed) return;

    builder.replaceState({
      ...builder.state,
      slots: enriched,
    });
  }, [catalogProducts, builder]);

  useEffect(() => {
    if (builder.state.name && !buildName) {
      setBuildName(builder.state.name);
    }
    if (builder.state.trek && !buildTrek) {
      setBuildTrek(builder.state.trek);
    }
  }, [builder.state.name, builder.state.trek, buildName, buildTrek]);

  useEffect(() => {
    if (fetcher.state !== 'idle') return;
    if (!fetcher.data || !('saved' in fetcher.data) || !fetcher.data.saved) return;
    if (lastHandledSave.current === fetcher.data) return;
    lastHandledSave.current = fetcher.data;

    setSaveNotice(true);
    setSaveOpen(false);
    if (fetcher.data.buildId) {
      builder.setBuildMeta({
        buildId: fetcher.data.buildId,
        name: buildNameRef.current.trim(),
        trek: buildTrekRef.current || undefined,
      });
    }
  }, [fetcher.data, fetcher.state, builder]);

  const grouped = useMemo(
    () => groupGearByType(gear.map((item) => item.builderProduct)),
    [gear],
  );

  const slots = builder.state.slots;
  const filledSlots = slots.filter((slot) => slot.productId).length;

  const hasAnyGear = filledSlots > 0;
  const canSaveBuild = filledSlots >= GEAR_BUILDER_MIN_SAVE_ITEMS;
  const subtotalDaily = slots.reduce((sum, slot) => sum + (slot.dailyRate ?? 0), 0);
  const pricing = calculateBundlePricing(subtotalDaily, 1, filledSlots);
  const cartLines = buildGearBuilderCartLines(slots);

  const activeProducts = activeType ? grouped[activeType] ?? [] : [];

  const handleClearDraft = () => {
    builder.clearAll();
    setActiveType(null);
    setBuildName('');
    setBuildTrek('');
    setSaveOpen(false);
    setSaveNotice(false);
    setSaveAsNew(false);

    if (searchParams.get('build')) {
      setHydratedBuildId(null);
      navigate('/gear-builder', {replace: true});
    }
  };

  const handleOpenSave = () => {
    setSaveNotice(false);
    setSaveAsNew(!builder.state.buildId);
    setSaveOpen(true);
  };

  const handleStartAnotherKit = () => {
    handleClearDraft();
  };

  const handleTrekPick = (trekValue: string) => {
    setBuildTrek(trekValue);
    const trek = trekOptions.find((entry) => entry.value === trekValue);
    if (trek && !buildName.trim()) {
      setBuildName(
        locale === 'ka' ? `${trek.label} — კომპლექტი` : `${trek.label} kit`,
      );
    }
  };

  const handleSave = () => {
    const name = buildName.trim();
    if (!name) return;

    const creatingNew = saveAsNew || !builder.state.buildId;

    builder.setBuildMeta({
      name,
      trek: buildTrek || undefined,
      buildId: creatingNew ? null : builder.state.buildId,
    });

    fetcher.submit(
      {
        intent: 'save',
        state: JSON.stringify({
          ...builder.state,
          name,
          trek: buildTrek || undefined,
          buildId: creatingNew ? undefined : builder.state.buildId,
        }),
        name,
        trek: buildTrek,
        buildId: creatingNew ? '' : (builder.state.buildId ?? ''),
        saveAsNew: creatingNew ? 'true' : 'false',
      },
      {method: 'post'},
    );
  };

  const saveError =
    fetcher.data && 'error' in fetcher.data ? fetcher.data.error : null;

  const hasTypes = slots.length > 0;
  const justSaved = saveNotice;
  const progressSteps = [
    {id: 1, label: tr.gearBuilder.stepPick, done: hasTypes},
    {id: 2, label: tr.gearBuilder.stepConfigure, done: hasAnyGear},
    {id: 3, label: tr.gearBuilder.stepSave, done: justSaved},
  ] as const;
  const currentStep = !hasTypes ? 1 : !hasAnyGear ? 2 : 3;

  return (
    <section className="cm-gear-builder-page bg-mist">
      <div className="tr-page-width cm-gear-builder-page-inner">
        <header className="cm-gear-builder-header">
          <div className="cm-gear-builder-header-main">
            <h1 className="cm-gear-builder-title">{tr.gearBuilder.title}</h1>
            <p className="cm-gear-builder-hint-note">{tr.gearBuilder.hintNote}</p>
          </div>

          <ol
            className="cm-gear-builder-progress"
            aria-label={tr.gearBuilder.stepsLabel}
          >
            {progressSteps.map((step, index) => {
              const isCurrent = step.id === currentStep && !step.done;
              const isDone = step.done;
              return (
                <li key={step.id} className="cm-gear-builder-progress-item">
                  {index > 0 ? (
                    <span className="cm-gear-builder-progress-sep" aria-hidden />
                  ) : null}
                  <span
                    className={`cm-gear-builder-progress-dot${
                      isDone
                        ? ' cm-gear-builder-progress-dot--done'
                        : isCurrent
                          ? ' cm-gear-builder-progress-dot--current'
                          : ' cm-gear-builder-progress-dot--pending'
                    }`}
                    aria-hidden
                  >
                    {isDone ? <IconCheck size={11} /> : step.id}
                  </span>
                  <span
                    className={`cm-gear-builder-progress-label${
                      isCurrent
                        ? ' cm-gear-builder-progress-label--current'
                        : isDone
                          ? ' cm-gear-builder-progress-label--done'
                          : ''
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </header>

        <GearBuilderStrip
          slots={slots}
          locale={locale}
          maxSlots={builder.maxSlots}
          activeType={activeType}
          onSelectType={setActiveType}
          onAddType={(type) => {
            builder.addItemType(type);
            setActiveType(type);
          }}
          onRemoveSlot={(type) => {
            builder.removeSlot(type);
            if (activeType === type) setActiveType(null);
          }}
          onClearSlotProduct={builder.clearSlotProduct}
          removeSlotLabel={tr.gearBuilder.removeSlot}
          clearItemLabel={tr.gearBuilder.clearSlotItem}
          slotLimitLabel={tr.gearBuilder.slotLimit}
        />

        <div className="cm-gear-builder-toolbar">
          <button
            type="button"
            className="tr-btn-secondary cm-gear-builder-toolbar-btn"
            disabled={!slots.length}
            onClick={handleClearDraft}
          >
            <IconTrash size={16} />
            {tr.gearBuilder.clearDraft}
          </button>

          <button
            type="button"
            className="tr-btn-secondary cm-gear-builder-toolbar-btn"
            disabled={!canSaveBuild}
            onClick={handleOpenSave}
          >
            <IconSave size={16} />
            {isLoggedIn ? tr.gearBuilder.saveGear : tr.gearBuilder.saveSession}
          </button>

          {saveNotice ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="cm-gear-builder-status cm-gear-builder-status--success">
                <IconCheck size={16} />
                {tr.gearBuilder.saved}
              </p>
              <button
                type="button"
                className="tr-btn-secondary cm-gear-builder-toolbar-btn"
                onClick={handleStartAnotherKit}
              >
                <IconLayers size={16} />
                {tr.gearBuilder.startAnotherKit}
              </button>
            </div>
          ) : null}
        </div>

        <GearBuilderSaveDialog
          open={saveOpen}
          onClose={() => setSaveOpen(false)}
          locale={locale}
          slots={slots}
          filledCount={filledSlots}
          bundleDailyLabel={pricing.bundleDailyLabel}
          subtotalDailyLabel={pricing.subtotalDailyLabel}
          discountPercent={pricing.discountPercent}
          buildName={buildName}
          buildTrek={buildTrek}
          trekOptions={trekOptions}
          saveError={saveError}
          isSaving={fetcher.state !== 'idle'}
          canSave={canSaveBuild}
          hasExistingBuild={Boolean(builder.state.buildId)}
          saveAsNew={saveAsNew}
          onSaveAsNewChange={setSaveAsNew}
          labels={{
            title: tr.gearBuilder.savePanelTitle,
            desc: tr.gearBuilder.savePanelDesc,
            close: tr.booking.close,
            buildName: tr.gearBuilder.buildName,
            buildNamePlaceholder: tr.gearBuilder.buildNamePlaceholder,
            trekLabel: tr.gearBuilder.trekLabel,
            confirmSave: tr.gearBuilder.confirmSave,
            cancelSave: tr.gearBuilder.cancelSave,
            itemsSelected: tr.gearBuilder.itemsSelected,
            dailyRate: tr.booking.dailyRate,
            bundleDiscount: tr.gearBuilder.bundleDiscount,
            nameRequired: tr.gearBuilder.nameRequired,
            minItemsRequired: tr.gearBuilder.minItemsRequired,
            maxBuilds: tr.gearBuilder.maxBuilds.replace(
              '{count}',
              String(GEAR_BUILDER_MAX_SAVED_BUILDS),
            ),
            saveFailed: tr.gearBuilder.saveFailed,
            removeItem: tr.gearBuilder.clearSlotItem,
            summaryEmpty: tr.gearBuilder.summaryEmpty,
            saveAsNew: tr.gearBuilder.saveAsNew,
            updateExisting: tr.gearBuilder.updateExisting,
          }}
          onBuildNameChange={setBuildName}
          onTrekPick={handleTrekPick}
          onRemoveItem={builder.clearSlotProduct}
          onSave={handleSave}
        />

        <div className="cm-gear-builder-layout">
          <div className="cm-gear-builder-main">
            {activeType ? (
              <>
                <div className="cm-gear-builder-main-head">
                  <GearTypeIcon type={activeType} size={22} className="text-forest" />
                  <h2 className="cm-gear-builder-section-title">
                    {gearTypeLabel(activeType, locale)}
                  </h2>
                </div>
                <GearOptionGrid
                  products={activeProducts}
                  locale={locale}
                  rentUnavailableLabel={tr.gearBuilder.rentUnavailable}
                  onSelect={(product, variantId) => {
                    if (!activeType) return;
                    builder.setSlotProduct(activeType, product, variantId);
                  }}
                />
              </>
            ) : (
              <div className="cm-gear-builder-hint-card">
                <IconLayers size={28} className="text-moss" />
                <p className="cm-gear-builder-hint">{tr.gearBuilder.pickSlotHint}</p>
              </div>
            )}
          </div>

          <aside className="cm-gear-builder-summary">
            <h2 className="cm-gear-builder-summary-title">{tr.booking.total}</h2>
            <div className="cm-gear-builder-summary-metrics">
              <div className="cm-gear-builder-summary-row">
                <span>{tr.gearBuilder.itemsSelected}</span>
                <span>{filledSlots}</span>
              </div>
              <div className="cm-gear-builder-summary-row">
                <span>{tr.booking.dailyRate}</span>
                <span className="cm-gear-builder-summary-price">
                  {pricing.bundleDailyLabel}
                </span>
              </div>
            </div>
            {pricing.discountPercent > 0 ? (
              <p className="cm-gear-builder-discount">
                -{pricing.discountPercent}% {tr.gearBuilder.bundleDiscount}
              </p>
            ) : null}
            <ul className="cm-gear-builder-summary-list">
              {slots.length ? (
                slots.map((slot) => (
                  <li key={slot.itemType}>
                    <GearTypeIcon type={slot.itemType} size={16} className="text-moss" />
                    <span>{slot.title ?? gearTypeLabel(slot.itemType, locale)}</span>
                  </li>
                ))
              ) : (
                <li className="cm-gear-builder-summary-empty">{tr.gearBuilder.summaryEmpty}</li>
              )}
            </ul>
            <CartForm
              route="/cart"
              inputs={{lines: cartLines}}
              action={CartForm.ACTIONS.LinesAdd}
            >
              {(cartFetcher) => {
                const addError = getCartActionErrorMessage(cartFetcher.data);
                return (
                  <>
                    {addError ? (
                      <p className="cm-rental-status cm-rental-status--error" role="alert">
                        {addError}
                      </p>
                    ) : null}
                    <button
                      type="submit"
                      className="tr-btn-primary cm-gear-builder-cart-btn w-full"
                      disabled={!cartLines.length || cartFetcher.state !== 'idle'}
                    >
                      <IconCart size={18} />
                      {tr.gearBuilder.addBundleToCart}
                    </button>
                  </>
                );
              }}
            </CartForm>
          </aside>
        </div>
      </div>
    </section>
  );
}
