import {useId, useMemo} from 'react';
import {useLocale} from '~/providers/LocaleProvider';
import {IconCalendar} from '~/components/trailrent/Icons';
import {
  countRentalDays,
  formatRentalDate,
  getMinRentalDate,
  getRentalDateRange,
  isDateRangeValid,
} from '~/lib/trailrent/pricing';

const PRESETS = [
  {key: '2' as const, days: 2},
  {key: '3' as const, days: 3},
  {key: '7' as const, days: 7},
];

export function RentalDateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRangeChange,
}: {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onRangeChange?: (range: {start: string; end: string}) => void;
}) {
  const {translations: tr, locale} = useLocale();
  const summaryId = useId();
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

  return (
    <div className="cm-date-range">
      <div className="cm-date-range-header">
        <span className="cm-date-range-icon" aria-hidden>
          <IconCalendar size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="cm-date-range-label">{tr.booking.dates}</p>
          <p id={summaryId} className="cm-date-range-summary">
            {formatRentalDate(startDate, locale)}
            <span className="cm-date-range-arrow" aria-hidden>
              →
            </span>
            {formatRentalDate(endDate, locale)}
          </p>
        </div>
        <span className="cm-date-range-badge">
          {days} {tr.booking.days}
        </span>
      </div>

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
          id="rental-start-date"
          label={tr.booking.startDate}
          value={startDate}
          displayValue={formatRentalDate(startDate, locale)}
          min={minDate}
          onChange={handleStartChange}
        />
        <span className="cm-date-range-fields-divider" aria-hidden />
        <DateField
          id="rental-end-date"
          label={tr.booking.endDate}
          value={endDate}
          displayValue={formatRentalDate(endDate, locale)}
          min={startDate || minDate}
          onChange={handleEndChange}
        />
      </div>

      {!valid ? (
        <p className="cm-date-range-error" role="alert">
          {tr.booking.invalidRange}
        </p>
      ) : null}
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
}: {
  id: string;
  label: string;
  value: string;
  displayValue: string;
  min: string;
  onChange: (value: string) => void;
}) {
  const {translations: tr} = useLocale();

  return (
    <label htmlFor={id} className="cm-date-range-field">
      <span className="cm-date-range-field-label">{label}</span>
      <span className="cm-date-range-field-value">{displayValue}</span>
      <span className="cm-date-range-field-hint">{tr.booking.tapToChange}</span>
      <input
        id={id}
        type="date"
        className="cm-date-range-native"
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      />
    </label>
  );
}
