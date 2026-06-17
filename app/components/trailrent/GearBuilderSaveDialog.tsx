import {useEffect} from 'react';
import type {GearBuilderSlot} from '~/lib/trailrent/gear-builder';
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
  discountPercent: number;
  buildName: string;
  buildTrek: string;
  trekOptions: TrekOption[];
  saveError: string | null;
  isSaving: boolean;
  canSave: boolean;
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
    maxBuilds: string;
    saveFailed: string;
  };
  onBuildNameChange: (value: string) => void;
  onTrekPick: (trekValue: string) => void;
  onSave: () => void;
};

export function GearBuilderSaveDialog({
  open,
  onClose,
  locale,
  slots,
  filledCount,
  bundleDailyLabel,
  discountPercent,
  buildName,
  buildTrek,
  trekOptions,
  saveError,
  isSaving,
  canSave,
  labels,
  onBuildNameChange,
  onTrekPick,
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
              <div className="cm-gear-builder-dialog-summary-row">
                <span>{labels.itemsSelected}</span>
                <span>{filledCount}</span>
              </div>
              <div className="cm-gear-builder-dialog-summary-row">
                <span>{labels.dailyRate}</span>
                <span className="cm-gear-builder-dialog-summary-price">
                  {bundleDailyLabel}
                </span>
              </div>
            </div>
            {discountPercent > 0 ? (
              <p className="cm-gear-builder-dialog-discount">
                -{discountPercent}% {labels.bundleDiscount}
              </p>
            ) : null}
            <ul className="cm-gear-builder-dialog-items">
              {filledSlots.map((slot) => (
                <li key={slot.itemType}>
                  <GearTypeIcon type={slot.itemType} size={16} className="text-moss" />
                  <span>{slot.title ?? gearTypeLabel(slot.itemType, locale)}</span>
                </li>
              ))}
            </ul>
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

          {saveError === 'name_required' ? (
            <p className="cm-gear-builder-status cm-gear-builder-status--error">
              {labels.nameRequired}
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
            {labels.confirmSave}
          </button>
        </footer>
      </div>
    </div>
  );
}
