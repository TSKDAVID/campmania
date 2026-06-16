import {Link} from 'react-router';
import type {GearBuilderProduct, GearBuilderSlot, GearItemType} from '~/lib/trailrent/gear-builder';
import {formatGel} from '~/lib/trailrent/pricing';
import {IconArrowRight, IconPackage} from '~/components/trailrent/Icons';

const TYPE_LABELS: Record<GearItemType, {ka: string; en: string; icon: string}> = {
  backpack: {ka: 'რუქსაკი', en: 'Backpack', icon: '🎒'},
  tent: {ka: 'ანსამბლი', en: 'Tent', icon: '⛺'},
  sleeping_bag: {ka: 'საძილებელი', en: 'Sleeping bag', icon: '🛏️'},
  shoes: {ka: 'ფეხსაცმელი', en: 'Shoes', icon: '👟'},
  kitchen: {ka: 'სამზარეულო', en: 'Kitchen', icon: '🍳'},
  lighting: {ka: 'განათება', en: 'Lighting', icon: '🔦'},
  navigation: {ka: 'ნავიგაცია', en: 'Navigation', icon: '🧭'},
  other: {ka: 'სხვა', en: 'Other', icon: '📦'},
};

export function gearTypeLabel(type: GearItemType, locale: 'ka' | 'en') {
  return locale === 'ka' ? TYPE_LABELS[type].ka : TYPE_LABELS[type].en;
}

export function gearTypeIcon(type: GearItemType) {
  return TYPE_LABELS[type].icon;
}

export function GearBuilderStrip({
  slots,
  locale,
  activeType,
  onSelectType,
  onAddType,
}: {
  slots: GearBuilderSlot[];
  locale: 'ka' | 'en';
  activeType?: GearItemType | null;
  onSelectType: (type: GearItemType) => void;
  onAddType: (type: GearItemType) => void;
}) {
  return (
    <div className="cm-gear-builder-strip" role="list">
      {slots.map((slot, index) => (
        <div key={slot.itemType} className="cm-gear-builder-strip-item" role="listitem">
          {index > 0 ? <span className="cm-gear-builder-plus" aria-hidden>+</span> : null}
          <button
            type="button"
            className={`cm-gear-builder-slot${
              activeType === slot.itemType ? ' cm-gear-builder-slot--active' : ''
            }`}
            onClick={() => onSelectType(slot.itemType)}
          >
            {slot.imageUrl ? (
              <img src={slot.imageUrl} alt="" className="cm-gear-builder-slot-image" />
            ) : (
              <span className="cm-gear-builder-slot-icon" aria-hidden>
                {gearTypeIcon(slot.itemType)}
              </span>
            )}
            <span className="cm-gear-builder-slot-label">
              {slot.title ?? gearTypeLabel(slot.itemType, locale)}
            </span>
          </button>
        </div>
      ))}
      <div className="cm-gear-builder-strip-item">
        {slots.length > 0 ? <span className="cm-gear-builder-plus" aria-hidden>+</span> : null}
        <AddTypeMenu locale={locale} onAddType={onAddType} existing={slots.map((s) => s.itemType)} />
      </div>
    </div>
  );
}

function AddTypeMenu({
  locale,
  onAddType,
  existing,
}: {
  locale: 'ka' | 'en';
  onAddType: (type: GearItemType) => void;
  existing: GearItemType[];
}) {
  const options = (Object.keys(TYPE_LABELS) as GearItemType[]).filter(
    (type) => type !== 'other' && !existing.includes(type),
  );

  return (
    <details className="cm-gear-builder-add">
      <summary className="cm-gear-builder-slot cm-gear-builder-slot--add">
        <span className="cm-gear-builder-slot-icon" aria-hidden>+</span>
        <span className="cm-gear-builder-slot-label">
          {locale === 'ka' ? 'დამატება' : 'Add type'}
        </span>
      </summary>
      <div className="cm-gear-builder-add-menu">
        {options.map((type) => (
          <button key={type} type="button" onClick={() => onAddType(type)}>
            <span aria-hidden>{gearTypeIcon(type)}</span>
            {gearTypeLabel(type, locale)}
          </button>
        ))}
      </div>
    </details>
  );
}

export function GearOptionGrid({
  products,
  locale,
  onSelect,
}: {
  products: GearBuilderProduct[];
  locale: 'ka' | 'en';
  onSelect: (product: GearBuilderProduct, variantId?: string) => void;
}) {
  if (!products.length) {
    return (
      <p className="cm-gear-builder-empty">
        {locale === 'ka'
          ? 'ამ ტიპის ხელმისაწვდომი ნივთი ვერ მოიძებნა.'
          : 'No available items for this type.'}
      </p>
    );
  }

  return (
    <div className="cm-gear-builder-options">
      {products.map((product) => (
        <article key={product.id} className="cm-gear-builder-option">
          <Link
            to={`/products/${product.handle}`}
            className="cm-gear-builder-option-media no-underline hover:no-underline"
            prefetch="intent"
          >
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.title} loading="lazy" />
            ) : (
              <span className="cm-gear-builder-option-fallback" aria-hidden>
                <IconPackage size={28} />
              </span>
            )}
          </Link>
          <div className="cm-gear-builder-option-body">
            <h3 className="cm-gear-builder-option-title">{product.title}</h3>
            <p className="cm-gear-builder-option-price">
              {formatGel(product.dailyRate)} / {locale === 'ka' ? 'დღე' : 'day'}
            </p>
            {product.variants.length > 1 ? (
              <div className="cm-gear-builder-variant-row">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={!variant.availableForSale}
                    className="cm-gear-builder-variant-btn"
                    onClick={() => onSelect(product, variant.id)}
                  >
                    {variant.title}
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="button"
                className="tr-btn-primary cm-gear-builder-select-btn"
                disabled={!product.availableForSale}
                onClick={() => onSelect(product, product.variantId)}
              >
                {locale === 'ka' ? 'არჩევა' : 'Select'}
                <IconArrowRight size={16} />
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
