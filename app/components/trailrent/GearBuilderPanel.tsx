import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import type {GearBuilderProduct, GearBuilderSlot, GearItemType} from '~/lib/trailrent/gear-builder';
import {filterRentVariants} from '~/lib/trailrent/product-variants';
import {formatGel} from '~/lib/trailrent/pricing';
import {IconArrowRight, IconPackage, IconX} from '~/components/trailrent/Icons';

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

function rentVariantsForProduct(product: GearBuilderProduct) {
  const asNodes = product.variants.map((variant) => ({
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    price: {amount: String(variant.price), currencyCode: 'GEL'},
  }));
  const rentOnly = filterRentVariants(asNodes);
  return rentOnly.map((variant) => ({
    id: variant.id,
    title: variant.title ?? '',
    availableForSale: variant.availableForSale !== false,
    price: Number(variant.price.amount),
  }));
}

export function GearBuilderStrip({
  slots,
  locale,
  activeType,
  onSelectType,
  onAddType,
  onRemoveSlot,
  onClearSlotProduct,
  removeSlotLabel,
  clearItemLabel,
}: {
  slots: GearBuilderSlot[];
  locale: 'ka' | 'en';
  activeType?: GearItemType | null;
  onSelectType: (type: GearItemType) => void;
  onAddType: (type: GearItemType) => void;
  onRemoveSlot: (type: GearItemType) => void;
  onClearSlotProduct: (type: GearItemType) => void;
  removeSlotLabel: string;
  clearItemLabel: string;
}) {
  return (
    <div className="cm-gear-builder-strip" role="list">
      {slots.map((slot, index) => (
        <div key={slot.itemType} className="cm-gear-builder-strip-item" role="listitem">
          {index > 0 ? <span className="cm-gear-builder-plus" aria-hidden>+</span> : null}
          <div className="cm-gear-builder-slot-wrap">
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
            <button
              type="button"
              className="cm-gear-builder-slot-remove"
              aria-label={removeSlotLabel}
              onClick={() => onRemoveSlot(slot.itemType)}
            >
              <IconX size={12} />
            </button>
            {slot.productId ? (
              <button
                type="button"
                className="cm-gear-builder-slot-clear"
                onClick={() => onClearSlotProduct(slot.itemType)}
              >
                {clearItemLabel}
              </button>
            ) : null}
          </div>
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const options = (Object.keys(TYPE_LABELS) as GearItemType[]).filter(
    (type) => type !== 'other' && !existing.includes(type),
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleAdd = (type: GearItemType) => {
    onAddType(type);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="cm-gear-builder-add">
      <button
        type="button"
        className={`cm-gear-builder-slot cm-gear-builder-slot--add${
          open ? ' cm-gear-builder-slot--active' : ''
        }`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="cm-gear-builder-slot-icon" aria-hidden>+</span>
        <span className="cm-gear-builder-slot-label">
          {locale === 'ka' ? 'დამატება' : 'Add type'}
        </span>
      </button>
      {open && options.length > 0 ? (
        <div className="cm-gear-builder-add-menu" role="menu">
          {options.map((type) => (
            <button
              key={type}
              type="button"
              role="menuitem"
              onClick={() => handleAdd(type)}
            >
              <span aria-hidden>{gearTypeIcon(type)}</span>
              {gearTypeLabel(type, locale)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
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
      {products.map((product) => {
        const rentVariants = rentVariantsForProduct(product);
        const defaultRent =
          rentVariants.find((variant) => variant.availableForSale) ?? rentVariants[0];
        const canSelect = Boolean(defaultRent?.availableForSale);

        return (
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
                {formatGel(defaultRent?.price ?? product.dailyRate)} /{' '}
                {locale === 'ka' ? 'დღე' : 'day'}
              </p>
              {rentVariants.length > 1 ? (
                <div className="cm-gear-builder-variant-row">
                  {rentVariants.map((variant) => (
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
                  disabled={!canSelect}
                  onClick={() => onSelect(product, defaultRent?.id ?? product.variantId)}
                >
                  {locale === 'ka' ? 'არჩევა' : 'Select'}
                  <IconArrowRight size={16} />
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
