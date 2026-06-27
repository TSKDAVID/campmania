import {useId, useMemo, useRef, type ReactNode} from 'react';
import {useLocale} from '~/providers/LocaleProvider';
import {IconCalendar} from '~/components/trailrent/Icons';
import {
  countRentalDays,
  formatRentalDate,
  formatRentalDateCompact,
  getMinRentalDate,
  getRentalDateRange,
  isDateRangeValid,
} from '~/lib/trailrent/pricing';

const PRESETS = [
  {key: '2' as const, days: 2},
  {key: '3' as const, days: 3},
  {key: '7' as const, days: 7},
];

type RentalDateRangePickerProps = {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onRangeChange?: (range: {start: string; end: string}) => void;
  layout?: 'default' | 'package';
  totalAmount?: string;
  submitSlot?: ReactNode;
};

export function RentalDateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRangeChange,
  layout = 'default',
  totalAmount,
  submitSlot,
}: RentalDateRangePickerProps) {
  const {translations: tr, locale} = useLocale();
  const summaryId = useId();
  const fieldBaseId = useId();
  const startFieldId = `${fieldBaseId}-start`;
  const endFieldId = `${fieldBaseId}-end`;
  const minDate = getMinRentalDate();

  const days = countRentalDays(startDate, endDate);
  const valid = isDateRangeValid(startDate, endDate);

  const presetLabels = useMemo(
    () => ({
      '2': tr.booking.preset2Days,
      '3': tr.booking.preset3Days,
      '7': tr.booking.presetWeek,
    }),
    [tr.booking.preset2Days, tr.booking.preset3Days, tr.booking.presetWeek],
  );

  const applyPreset = (rentalDays: number) => {
    const range = getRentalDateRange(rentalDays);
    onStartDateChange(range.start);
    onEndDateChange(range.end);
    onRangeChange?.(range);
  };

  const handleStartChange = (value: string) => {
    onStartDateChange(value);
    if (value > endDate) {
      onEndDateChange(value);
      onRangeChange?.({start: value, end: value});
      return;
    }
    onRangeChange?.({start: value, end: endDate});
  };

  const handleEndChange = (value: string) => {
    onEndDateChange(value);
    onRangeChange?.({start: startDate, end: value});
  };

  const fieldDisplayDate =
    layout === 'package'
      ? (date: string) => formatRentalDateCompact(date, locale)
      : (date: string) => formatRentalDate(date, locale);

  const pickerBody = (
    <>
      <div
        className="cm-date-range-presets"
        role="group"
        aria-label={tr.booking.dates}
      >
        {PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            className={`cm-date-range-preset${days === preset.days ? ' cm-date-range-preset--active' : ''}`}
            onClick={() => applyPreset(preset.days)}
            aria-pressed={days === preset.days}
          >
            {presetLabels[preset.key]}
          </button>
        ))}
      </div>

      <div className="cm-date-range-fields">
        <DateField
          id={startFieldId}
          label={tr.booking.startDate}
          value={startDate}
          displayValue={fieldDisplayDate(startDate)}
          min={minDate}
          onChange={handleStartChange}
          variant={layout === 'package' ? 'package' : 'default'}
        />
        <span className="cm-date-range-fields-divider" aria-hidden />
        <DateField
          id={endFieldId}
          label={tr.booking.endDate}
          value={endDate}
          displayValue={fieldDisplayDate(endDate)}
          min={startDate || minDate}
          onChange={handleEndChange}
          variant={layout === 'package' ? 'package' : 'default'}
        />
      </div>

      {!valid ? (
        <p className="cm-date-range-error" role="alert">
          {tr.booking.invalidRange}
        </p>
      ) : null}
    </>
  );

  const dateHeader =
    layout === 'package' ? (
      <div className="cm-date-range-header cm-date-range-header--package">
        <div className="cm-date-range-header__main">
          <p className="cm-date-range-label">{tr.booking.dates}</p>
          <p id={summaryId} className="cm-date-range-summary cm-date-range-summary--compact">
            <span className="cm-date-range-summary__date">
              {formatRentalDateCompact(startDate, locale)}
            </span>
            <span className="cm-date-range-arrow" aria-hidden />
            <span className="cm-date-range-summary__date">
              {formatRentalDateCompact(endDate, locale)}
            </span>
          </p>
        </div>
        <div className="cm-date-range-header__aside">
          <span className="cm-date-range-badge">
            {days} {tr.booking.days}
          </span>
          {totalAmount ? (
            <span className="cm-date-range-total">{totalAmount}</span>
          ) : null}
        </div>
      </div>
    ) : (
      <div className="cm-date-range-header">
        <span className="cm-date-range-icon" aria-hidden>
          <IconCalendar size={18} />
        </span>
        <div className="cm-date-range-header__main">
          <p className="cm-date-range-label">{tr.booking.dates}</p>
          <p id={summaryId} className="cm-date-range-summary">
            <span className="cm-date-range-summary__date">
              {formatRentalDate(startDate, locale)}
            </span>
            <span className="cm-date-range-arrow" aria-hidden />
            <span className="cm-date-range-summary__date">
              {formatRentalDate(endDate, locale)}
            </span>
          </p>
        </div>
        {totalAmount ? (
          <div className="cm-date-range-header__aside">
            <span className="cm-date-range-total">{totalAmount}</span>
          </div>
        ) : (
          <span className="cm-date-range-badge">
            {days} {tr.booking.days}
          </span>
        )}
      </div>
    );

  if (layout === 'package') {
    return (
      <div className="cm-date-range cm-date-range--package">
        <div className="cm-date-range-package-shell">
          {dateHeader}
          {pickerBody}
        </div>
        {submitSlot ? (
          <div className="cm-package-submit-row">{submitSlot}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="cm-date-range">
      {dateHeader}
      {pickerBody}
    </div>
  );
}

function DateField({
  id,
  label,
  value,
  displayValue,
  min,
  onChange,
  variant = 'default',
}: {
  id: string;
  label: string;
  value: string;
  displayValue: string;
  min: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'package';
}) {
  const {translations: tr} = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;

    input.focus({preventScroll: true});

    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
        return;
      } catch {
        // showPicker can throw outside a direct user gesture
      }
    }

    input.click();
  };

  return (
    <div
      className={`cm-date-range-field${variant === 'package' ? ' cm-date-range-field--package' : ''}`}
    >
      <button
        type="button"
        className="cm-date-range-field-trigger"
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-controls={id}
        aria-label={`${label}: ${displayValue}`}
      >
        <span className="cm-date-range-field-label">{label}</span>
        <span className="cm-date-range-field-value">{displayValue}</span>
        {variant === 'package' ? (
          <span className="cm-date-range-field-edit" aria-hidden>
            <IconCalendar size={14} />
            <span>{tr.booking.tapToChange}</span>
          </span>
        ) : (
          <span className="cm-date-range-field-hint">{tr.booking.tapToChange}</span>
        )}
      </button>
      <input
        ref={inputRef}
        id={id}
        type="date"
        className="cm-date-range-native"
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        tabIndex={-1}
      />
    </div>
  );
}
