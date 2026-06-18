import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {useGearBuilder} from '~/providers/GearBuilderProvider';
import {useLocale} from '~/providers/LocaleProvider';
import type {GearBuilderProduct} from '~/lib/trailrent/gear-builder';
import {IconCheck, IconPackage} from '~/components/trailrent/Icons';

const ADDED_FEEDBACK_MS = 3200;

export function AddToGearBuilderButton({
  product,
  variantId,
  className = 'tr-btn-secondary w-full',
}: {
  product: GearBuilderProduct;
  variantId?: string;
  className?: string;
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

  return (
    <div className="cm-gear-builder-pdp-actions">
      <button
        type="button"
        className={`${className}${added ? ' cm-gear-builder-pdp-btn--added' : ''}`}
        onClick={handleAdd}
        aria-pressed={added}
      >
        {added ? <IconCheck size={18} /> : <IconPackage size={18} />}
        {added ? tr.gearBuilder.addedToBuilder : tr.gearBuilder.addToBuilder}
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

      <Link to="/gear-builder" className="cm-gear-builder-pdp-link">
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
