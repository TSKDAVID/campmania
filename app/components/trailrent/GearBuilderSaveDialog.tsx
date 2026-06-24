import {useEffect} from 'react';
import type {GearBuilderSlot} from '~/lib/trailrent/gear-builder';
import {formatGel} from '~/lib/trailrent/pricing';
import {GearTypeIcon, gearTypeLabel} from '~/components/trailrent/GearBuilderPanel';
import {IconMountain, IconSave, IconX} from '~/components/trailrent/Icons';

type TrekOption = {value: string; label: string};

type GearBuilderSaveDialogProps = {
  open: boolean;
  onClose: () => void;
  locale: 'ka' | 'en';
  slots: GearBuilderSlot[];
  filledCount: number;
  bundleDailyLabel: string;
  subtotalDailyLabel: string;
  discountPercent: number;
  buildName: string;
  buildTrek: string;
  trekOptions: TrekOption[];
  saveError: string | null;
  isSaving: boolean;
  canSave: boolean;
  hasExistingBuild?: boolean;
  saveAsNew?: boolean;
  onSaveAsNewChange?: (value: boolean) => void;
  labels: {
    title: string;
    desc: string;
    close: string;
    buildName: string;
    buildNamePlaceholder: string;
    trekLabel: string;
    confirmSave: string;
    cancelSave: string;
    itemsSelected: string;
    dailyRate: string;
    bundleDiscount: string;
    nameRequired: string;
    minItemsRequired: string;
    maxBuilds: string;
    saveFailed: string;
    removeItem: string;
    summaryEmpty: string;
    saveAsNew?: string;
    updateExisting?: string;
  };
  onBuildNameChange: (value: string) => void;
  onTrekPick: (trekValue: string) => void;
  onRemoveItem: (itemType: GearBuilderSlot['itemType']) => void;
  onSave: () => void;
};

export function GearBuilderSaveDialog({
  open,
  onClose,
  locale,
  slots,
  filledCount,
  bundleDailyLabel,
  subtotalDailyLabel,
  discountPercent,
  buildName,
  buildTrek,
  trekOptions,
  saveError,
  isSaving,
  canSave,
  hasExistingBuild = false,
  saveAsNew = false,
  onSaveAsNewChange,
  labels,
  onBuildNameChange,
  onTrekPick,
  onRemoveItem,
  onSave,
}: GearBuilderSaveDialogProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const filledSlots = slots.filter((slot) => slot.productId);
  const showDiscount = discountPercent > 0;

  return (
    <div className="cm-gear-builder-dialog" role="dialog" aria-modal="true">
      <button
        type="button"
        className="cm-gear-builder-dialog-backdrop"
        aria-label={labels.close}
        onClick={onClose}
      />
      <div className="cm-gear-builder-dialog-panel">
        <header className="cm-gear-builder-dialog-header">
          <div className="flex items-start gap-3">
            <span className="cm-gear-builder-dialog-icon" aria-hidden>
              <IconMountain size={20} />
            </span>
            <div>
              <h2 className="cm-gear-builder-dialog-title">{labels.title}</h2>
              <p className="cm-gear-builder-dialog-desc">{labels.desc}</p>
            </div>
          </div>
          <button
            type="button"
            className="cm-gear-builder-dialog-close"
            onClick={onClose}
            aria-label={labels.close}
          >
            <IconX size={18} />
          </button>
        </header>

        <div className="cm-gear-builder-dialog-body">
          <section className="cm-gear-builder-dialog-summary">
            <div className="cm-gear-builder-dialog-summary-metrics">
              <div className="cm-gear-builder-dialog-metric">
                <span className="cm-gear-builder-dialog-metric-label">
                  {labels.itemsSelected}
                </span>
                <span className="cm-gear-builder-dialog-metric-value">{filledCount}</span>
              </div>
              <div className="cm-gear-builder-dialog-metric">
                <span className="cm-gear-builder-dialog-metric-label">
                  {labels.dailyRate}
                </span>
                <span className="cm-gear-builder-dialog-summary-price">
                  {showDiscount ? (
                    <>
                      <span className="cm-gear-builder-dialog-price-was">
                        {subtotalDailyLabel}
                      </span>
                      {bundleDailyLabel}
                    </>
                  ) : (
                    bundleDailyLabel
                  )}
                </span>
              </div>
            </div>

            {showDiscount ? (
              <p className="cm-gear-builder-dialog-discount">
                -{discountPercent}% {labels.bundleDiscount}
              </p>
            ) : null}

            {filledSlots.length ? (
              <ul className="cm-gear-builder-dialog-items">
                {filledSlots.map((slot) => (
                  <li key={slot.itemType} className="cm-gear-builder-dialog-item">
                    <div className="cm-gear-builder-dialog-item-media">
                      {slot.imageUrl ? (
                        <img src={slot.imageUrl} alt="" loading="lazy" />
                      ) : (
                        <GearTypeIcon
                          type={slot.itemType}
                          size={18}
                          className="text-moss"
                        />
                      )}
                    </div>
                    <div className="cm-gear-builder-dialog-item-body">
                      <span className="cm-gear-builder-dialog-item-type">
                        {gearTypeLabel(slot.itemType, locale)}
                      </span>
                      <span className="cm-gear-builder-dialog-item-title">
                        {slot.title ?? gearTypeLabel(slot.itemType, locale)}
                      </span>
                      {slot.dailyRate ? (
                        <span className="cm-gear-builder-dialog-item-rate">
                          {formatGel(slot.dailyRate)}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="cm-gear-builder-dialog-item-remove"
                      aria-label={labels.removeItem}
                      onClick={() => onRemoveItem(slot.itemType)}
                    >
                      <IconX size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cm-gear-builder-dialog-items-empty">{labels.summaryEmpty}</p>
            )}
          </section>

          <label className="cm-gear-builder-field">
            <span>{labels.buildName}</span>
            <input
              type="text"
              value={buildName}
              maxLength={48}
              placeholder={labels.buildNamePlaceholder}
              autoFocus
              onChange={(event) => onBuildNameChange(event.target.value)}
            />
          </label>

          <div className="cm-gear-builder-field">
            <span>{labels.trekLabel}</span>
            <div className="cm-gear-builder-trek-chips">
              {trekOptions.map((trek) => (
                <button
                  key={trek.value}
                  type="button"
                  className={`cm-gear-builder-trek-chip${
                    buildTrek === trek.value ? ' cm-gear-builder-trek-chip--active' : ''
                  }`}
                  onClick={() => onTrekPick(trek.value)}
                >
                  {trek.label}
                </button>
              ))}
            </div>
          </div>

          {hasExistingBuild && onSaveAsNewChange && labels.saveAsNew ? (
            <label className="flex items-center gap-2 text-sm text-charcoal/85">
              <input
                type="checkbox"
                checked={saveAsNew}
                onChange={(event) => onSaveAsNewChange(event.target.checked)}
              />
              <span>{labels.saveAsNew}</span>
            </label>
          ) : null}

          {!canSave ? (
            <p className="cm-gear-builder-status cm-gear-builder-status--muted">
              {labels.minItemsRequired}
            </p>
          ) : null}
          {saveError === 'name_required' ? (
            <p className="cm-gear-builder-status cm-gear-builder-status--error">
              {labels.nameRequired}
            </p>
          ) : null}
          {saveError === 'min_items' ? (
            <p className="cm-gear-builder-status cm-gear-builder-status--error">
              {labels.minItemsRequired}
            </p>
          ) : null}
          {saveError === 'max_builds' ? (
            <p className="cm-gear-builder-status cm-gear-builder-status--error">
              {labels.maxBuilds}
            </p>
          ) : null}
          {saveError === 'save_failed' || saveError === 'invalid_state' ? (
            <p className="cm-gear-builder-status cm-gear-builder-status--error">
              {labels.saveFailed}
            </p>
          ) : null}
        </div>

        <footer className="cm-gear-builder-dialog-footer">
          <button type="button" className="tr-btn-secondary" onClick={onClose}>
            {labels.cancelSave}
          </button>
          <button
            type="button"
            className="tr-btn-primary cm-gear-builder-dialog-save"
            disabled={!buildName.trim() || !canSave || isSaving}
            onClick={onSave}
          >
            <IconSave size={16} />
            {hasExistingBuild && !saveAsNew && labels.updateExisting
              ? labels.updateExisting
              : labels.confirmSave}
          </button>
        </footer>
      </div>
    </div>
  );
}
