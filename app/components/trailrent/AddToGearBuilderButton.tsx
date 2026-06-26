import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {useGearBuilder} from '~/providers/GearBuilderProvider';
import {useLocale} from '~/providers/LocaleProvider';
import type {GearBuilderProduct} from '~/lib/trailrent/gear-builder';
import {IconCheck, IconCompass, IconPlus} from '~/components/trailrent/Icons';

const ADDED_FEEDBACK_MS = 3200;

export function AddToGearBuilderButton({
  product,
  variantId,
  className = 'tr-btn-secondary w-full',
  layout = 'stacked',
}: {
  product: GearBuilderProduct;
  variantId?: string;
  className?: string;
  layout?: 'stacked' | 'aside' | 'toolbar';
}) {
  const {translations: tr} = useLocale();
  const {addProduct, state} = useGearBuilder();
  const [added, setAdded] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filledCount = state.slots.filter((slot) => slot.variantId).length;

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  if (!product.metafields.builderEnabled && product.metafields.itemType === 'other') {
    return null;
  }

  function handleAdd() {
    const didAdd = addProduct(product, variantId);
    if (!didAdd) return;

    setAdded(true);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setAdded(false), ADDED_FEEDBACK_MS);
  }

  const isAside = layout === 'aside';
  const isToolbar = layout === 'toolbar';
  const iconSize = isToolbar ? 18 : isAside ? 16 : 18;
  const addLabel = added ? tr.gearBuilder.addedToBuilder : tr.gearBuilder.addToBuilder;

  if (isToolbar) {
    return (
      <div className="cm-gear-builder-pdp-actions cm-gear-builder-pdp-actions--toolbar">
        <button
          type="button"
          className={`cm-gear-builder-pdp-toolbar-btn${
            added ? ' cm-gear-builder-pdp-toolbar-btn--added' : ''
          }`}
          onClick={handleAdd}
          aria-pressed={added}
          title={addLabel}
        >
          <span className="cm-gear-builder-pdp-toolbar-btn__icon" aria-hidden>
            {added ? <IconCheck size={iconSize} /> : <IconPlus size={iconSize} />}
          </span>
          <span className="cm-gear-builder-pdp-toolbar-btn__label">{addLabel}</span>
        </button>

        <Link
          to="/gear-builder"
          className="cm-gear-builder-pdp-toolbar-btn cm-gear-builder-pdp-toolbar-btn--open"
          title={tr.gearBuilder.openBuilder}
        >
          <span className="cm-gear-builder-pdp-toolbar-btn__icon" aria-hidden>
            <IconCompass size={iconSize} />
          </span>
          <span className="cm-gear-builder-pdp-toolbar-btn__label">
            {tr.gearBuilder.openBuilder}
          </span>
          {filledCount > 0 ? (
            <span
              className="cm-gear-builder-pdp-toolbar-btn__count"
              aria-label={tr.gearBuilder.itemsSelected}
            >
              {filledCount}
            </span>
          ) : null}
        </Link>
      </div>
    );
  }

  const addBtnClass = isAside
    ? `tr-btn-secondary cm-gear-builder-pdp-btn${added ? ' cm-gear-builder-pdp-btn--added' : ''}`
    : `${className}${added ? ' cm-gear-builder-pdp-btn--added' : ''}`;

  return (
    <div
      className={`cm-gear-builder-pdp-actions${
        isAside ? ' cm-gear-builder-pdp-actions--aside' : ''
      }`}
    >
      <button
        type="button"
        className={addBtnClass}
        onClick={handleAdd}
        aria-pressed={added}
      >
        {added ? <IconCheck size={iconSize} /> : <IconPlus size={iconSize} />}
        {addLabel}
      </button>

      {added ? (
        <p
          className="cm-gear-builder-status cm-gear-builder-status--success cm-gear-builder-pdp-added"
          role="status"
          aria-live="polite"
        >
          <IconCheck size={16} />
          {tr.gearBuilder.addedToBuilderMessage}
        </p>
      ) : null}

      <Link
        to="/gear-builder"
        className={isAside ? 'tr-btn-ghost cm-gear-builder-pdp-open' : 'cm-gear-builder-pdp-link'}
      >
        <IconCompass size={16} />
        {tr.gearBuilder.openBuilder}
        {filledCount > 0 ? (
          <span className="cm-gear-builder-pdp-count" aria-label={tr.gearBuilder.itemsSelected}>
            {filledCount}
          </span>
        ) : null}
      </Link>
    </div>
  );
}
