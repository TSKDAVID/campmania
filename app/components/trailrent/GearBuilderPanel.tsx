import {useEffect, useRef, useState, type ComponentType} from 'react';
import {Link} from 'react-router';
import type {GearBuilderProduct, GearBuilderSlot, GearItemType} from '~/lib/trailrent/gear-builder';
import {
  builderRentVariantPrice,
  builderRentVariants,
  resolveBuilderRentVariant,
} from '~/lib/trailrent/gear-builder/variants';
import {formatGel} from '~/lib/trailrent/pricing';
import {
  IconArrowRight,
  IconBackpack,
  IconBoot,
  IconCompass,
  IconFlashlight,
  IconKitchen,
  IconPackage,
  IconPlus,
  IconSleepingBag,
  IconTent,
  IconX,
  type IconProps,
} from '~/components/trailrent/Icons';

const TYPE_LABELS: Record<
  GearItemType,
  {ka: string; en: string; icon: ComponentType<IconProps>}
> = {
  backpack: {ka: 'რუქსაკი', en: 'Backpack', icon: IconBackpack},
  tent: {ka: 'კარავი', en: 'Tent', icon: IconTent},
  sleeping_bag: {ka: 'საძილებელი', en: 'Sleeping bag', icon: IconSleepingBag},
  shoes: {ka: 'ფეხსაცმელი', en: 'Shoes', icon: IconBoot},
  kitchen: {ka: 'სამზარეულო', en: 'Kitchen', icon: IconKitchen},
  lighting: {ka: 'განათება', en: 'Lighting', icon: IconFlashlight},
  navigation: {ka: 'ნავიგაცია', en: 'Navigation', icon: IconCompass},
  other: {ka: 'სხვა', en: 'Other', icon: IconPackage},
};

export function gearTypeLabel(type: GearItemType, locale: 'ka' | 'en') {
  return locale === 'ka' ? TYPE_LABELS[type].ka : TYPE_LABELS[type].en;
}

export function GearTypeIcon({
  type,
  size = 22,
  className = '',
}: {
  type: GearItemType;
  size?: number;
  className?: string;
}) {
  const Icon = TYPE_LABELS[type].icon;
  return <Icon size={size} className={className} />;
}

export function GearBuilderStrip({
  slots,
  locale,
  activeType,
  maxSlots,
  onSelectType,
  onAddType,
  onRemoveSlot,
  onClearSlotProduct,
  removeSlotLabel,
  clearItemLabel,
  slotLimitLabel,
}: {
  slots: GearBuilderSlot[];
  locale: 'ka' | 'en';
  activeType?: GearItemType | null;
  maxSlots: number;
  onSelectType: (type: GearItemType) => void;
  onAddType: (type: GearItemType) => void;
  onRemoveSlot: (type: GearItemType) => void;
  onClearSlotProduct: (type: GearItemType) => void;
  removeSlotLabel: string;
  clearItemLabel: string;
  slotLimitLabel: string;
}) {
  const atLimit = slots.length >= maxSlots;

  return (
    <div className="cm-gear-builder-strip">
      <div className="cm-gear-builder-strip-head">
        <p className="cm-gear-builder-strip-title">
          {locale === 'ka' ? 'თქვენი კომპლექტი' : 'Your kit'}
        </p>
        <span className="cm-gear-builder-slot-count">
          {slots.length}/{maxSlots}
        </span>
      </div>

      <div className="cm-gear-builder-strip-track" role="list">
        {slots.map((slot, index) => (
          <div key={slot.itemType} className="cm-gear-builder-strip-item" role="listitem">
            {index > 0 ? (
              <span className="cm-gear-builder-connector" aria-hidden />
            ) : null}
            <div className="cm-gear-builder-slot-wrap">
              <button
                type="button"
                className={`cm-gear-builder-slot${
                  activeType === slot.itemType ? ' cm-gear-builder-slot--active' : ''
                }${slot.productId ? ' cm-gear-builder-slot--filled' : ''}`}
                onClick={() => onSelectType(slot.itemType)}
              >
                <span className="cm-gear-builder-slot-media">
                  {slot.imageUrl ? (
                    <img src={slot.imageUrl} alt="" className="cm-gear-builder-slot-image" />
                  ) : (
                    <GearTypeIcon type={slot.itemType} size={20} className="text-forest" />
                  )}
                </span>
                <span className="cm-gear-builder-slot-label">
                  {slot.title ?? gearTypeLabel(slot.itemType, locale)}
                </span>
                {slot.dailyRate ? (
                  <span className="cm-gear-builder-slot-rate">
                    {formatGel(slot.dailyRate)}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className="cm-gear-builder-slot-remove"
                aria-label={removeSlotLabel}
                onClick={() => onRemoveSlot(slot.itemType)}
              >
                <IconX size={11} />
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

        {!atLimit ? (
          <div className="cm-gear-builder-strip-item">
            {slots.length > 0 ? (
              <span className="cm-gear-builder-connector" aria-hidden />
            ) : null}
            <AddTypeMenu
              locale={locale}
              onAddType={onAddType}
              existing={slots.map((s) => s.itemType)}
            />
          </div>
        ) : (
          <p className="cm-gear-builder-limit-note">{slotLimitLabel}</p>
        )}
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
        <span className="cm-gear-builder-slot-media cm-gear-builder-slot-media--add">
          <IconPlus size={18} />
        </span>
        <span className="cm-gear-builder-slot-label">
          {locale === 'ka' ? 'დამატება' : 'Add item'}
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
              <GearTypeIcon type={type} size={18} />
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
  rentUnavailableLabel,
}: {
  products: GearBuilderProduct[];
  locale: 'ka' | 'en';
  onSelect: (product: GearBuilderProduct, variantId?: string) => void;
  rentUnavailableLabel: string;
}) {
  if (!products.length) {
    return (
      <div className="cm-gear-builder-empty-state">
        <IconPackage size={28} className="text-moss" />
        <p>
          {locale === 'ka'
            ? 'ამ ტიპის ხელმისაწვდომი ნივთი ვერ მოიძებნა.'
            : 'No available items for this type.'}
        </p>
      </div>
    );
  }

  return (
    <div className="cm-gear-builder-options">
      {products.map((product) => {
        const rentVariants = builderRentVariants(product);
        const defaultRent = resolveBuilderRentVariant(product);
        const canSelect = Boolean(defaultRent?.id);
        const rentInStock = defaultRent?.availableForSale !== false;

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
                {formatGel(builderRentVariantPrice(product, defaultRent))} /{' '}
                {locale === 'ka' ? 'დღე' : 'day'}
              </p>
              {!rentInStock && canSelect ? (
                <p className="cm-gear-builder-option-note">{rentUnavailableLabel}</p>
              ) : null}
              {rentVariants.length > 1 ? (
                <div className="cm-gear-builder-variant-row">
                  {rentVariants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={!variant.id}
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
                  onClick={() => onSelect(product, defaultRent?.id)}
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
