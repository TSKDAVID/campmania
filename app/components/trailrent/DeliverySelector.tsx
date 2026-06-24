import {useId, useMemo} from 'react';
import {useLocale} from '~/providers/LocaleProvider';

export type DeliveryOption = 'metro' | 'home';

export const HOME_DELIVERY_FEE = 7;

/** Standard Tbilisi metro: Akhmeteli–Varketili (red) + Saburtalo (green) lines. */
export const TBILISI_METRO_STATIONS: Array<{
  id: string;
  line: 'akhmeteli-varketili' | 'saburtalo';
  nameKa: string;
  nameEn: string;
}> = [
  {id: 'akhmeteli-theatre', line: 'akhmeteli-varketili', nameKa: 'ახმეტელის თეატრი', nameEn: 'Akhmeteli Theatre'},
  {id: 'sarajishvili', line: 'akhmeteli-varketili', nameKa: 'სარაჯიშვილი', nameEn: 'Sarajishvili'},
  {id: 'guramishvili', line: 'akhmeteli-varketili', nameKa: 'გურამიშვილი', nameEn: 'Guramishvili'},
  {id: 'ghrmaghele', line: 'akhmeteli-varketili', nameKa: 'ღრმაღელე', nameEn: 'Ghrmaghele'},
  {id: 'didube', line: 'akhmeteli-varketili', nameKa: 'დიდუბე', nameEn: 'Didube'},
  {id: 'gotsiridze', line: 'akhmeteli-varketili', nameKa: 'გოცირიძე', nameEn: 'Gotsiridze'},
  {id: 'nadzaladevi', line: 'akhmeteli-varketili', nameKa: 'ნაძალადევი', nameEn: 'Nadzaladevi'},
  {id: 'station-square-1', line: 'akhmeteli-varketili', nameKa: 'სადგურის მოედანი I', nameEn: 'Station Square I'},
  {id: 'marjanishvili', line: 'akhmeteli-varketili', nameKa: 'მარჯანიშვილი', nameEn: 'Marjanishvili'},
  {id: 'rustaveli', line: 'akhmeteli-varketili', nameKa: 'რუსთაველი', nameEn: 'Rustaveli'},
  {id: 'liberty-square', line: 'akhmeteli-varketili', nameKa: 'თავისუფლების მოედანი', nameEn: 'Liberty Square'},
  {id: 'avlabari', line: 'akhmeteli-varketili', nameKa: 'ავლაბარი', nameEn: 'Avlabari'},
  {id: '300-aragveli', line: 'akhmeteli-varketili', nameKa: '300 არაგველი', nameEn: '300 Aragveli'},
  {id: 'isani', line: 'akhmeteli-varketili', nameKa: 'ისანი', nameEn: 'Isani'},
  {id: 'samgori', line: 'akhmeteli-varketili', nameKa: 'სამგორი', nameEn: 'Samgori'},
  {id: 'varketili', line: 'akhmeteli-varketili', nameKa: 'ვარკეთილი', nameEn: 'Varketili'},
  {id: 'station-square-2', line: 'saburtalo', nameKa: 'სადგურის მოედანი II', nameEn: 'Station Square II'},
  {id: 'tsereteli', line: 'saburtalo', nameKa: 'წერეთელი', nameEn: 'Tsereteli'},
  {id: 'technical-university', line: 'saburtalo', nameKa: 'ტექნიკური უნივერსიტეტი', nameEn: 'Technical University'},
  {id: 'medical-university', line: 'saburtalo', nameKa: 'სამედიცინო უნივერსიტეტი', nameEn: 'Medical University'},
  {id: 'delisi', line: 'saburtalo', nameKa: 'დელისი', nameEn: 'Delisi'},
  {id: 'vazha-pshavela', line: 'saburtalo', nameKa: 'ვაჟა-ფშაველა', nameEn: 'Vazha-Pshavela'},
  {id: 'state-university', line: 'saburtalo', nameKa: 'სახელმწიფო უნივერსიტეტი', nameEn: 'State University'},
];

type DeliverySelectorProps = {
  option: DeliveryOption;
  onOptionChange: (next: DeliveryOption) => void;
  metroStationId: string;
  onMetroStationChange: (id: string) => void;
  address: string;
  onAddressChange: (address: string) => void;
};

export function DeliverySelector({
  option,
  onOptionChange,
  metroStationId,
  onMetroStationChange,
  address,
  onAddressChange,
}: DeliverySelectorProps) {
  const {locale} = useLocale();
  const isKa = locale === 'ka';
  const metroPanelId = useId();
  const homePanelId = useId();

  const metroLabel = isKa ? 'მეტროსადგურზე მიწოდება' : 'Metro station pickup';
  const homeLabel = isKa ? 'მისამართზე მიწოდება' : 'Doorstep delivery';
  const metroBadge = isKa ? '0 GEL (უფასო)' : '0 GEL (free)';
  const homeBadge = '+7 GEL';
  const metroMicrocopy = isKa
    ? 'მიიღე უახლოეს სადგურზე — გადასაცემი ფანჯარა 10:00–20:00.'
    : 'Pickup at any Tbilisi metro station, 10:00–20:00.';
  const homeMicrocopy = isKa
    ? 'მინიმუმ 24 საათით ადრე ჯავშანი.'
    : 'Book at least 24h in advance.';
  const addressPlaceholder = isKa
    ? 'ქუჩა, კორპუსი, ბინა'
    : 'Street, building, apartment';

  const groupedStations = useMemo(() => {
    const akhmeteli = TBILISI_METRO_STATIONS.filter(
      (s) => s.line === 'akhmeteli-varketili',
    );
    const saburtalo = TBILISI_METRO_STATIONS.filter(
      (s) => s.line === 'saburtalo',
    );
    return {akhmeteli, saburtalo};
  }, []);

  return (
    <fieldset
      className="cm-delivery"
      role="radiogroup"
      aria-label={isKa ? 'მიწოდების მეთოდი' : 'Delivery method'}
    >
      <legend className="cm-delivery__legend">
        {isKa ? '03 — მიწოდება' : '03 — Delivery'}
      </legend>

      <div className="cm-delivery__stack">
        <DeliveryBlock
          active={option === 'metro'}
          onSelect={() => onOptionChange('metro')}
          title={metroLabel}
          badge={metroBadge}
          badgeTone="free"
          microcopy={metroMicrocopy}
          ariaControls={metroPanelId}
        >
          {option === 'metro' ? (
            <div id={metroPanelId} className="cm-delivery__panel">
              <label htmlFor="cm-metro-select" className="cm-delivery__field-label">
                {isKa ? 'სადგური' : 'Station'}
              </label>
              <select
                id="cm-metro-select"
                className="cm-delivery__select"
                value={metroStationId}
                onChange={(event) => onMetroStationChange(event.target.value)}
              >
                <optgroup
                  label={isKa ? 'ახმეტელი — ვარკეთილი (წითელი)' : 'Akhmeteli–Varketili (Red)'}
                >
                  {groupedStations.akhmeteli.map((station) => (
                    <option key={station.id} value={station.id}>
                      {isKa ? station.nameKa : station.nameEn}
                    </option>
                  ))}
                </optgroup>
                <optgroup
                  label={isKa ? 'საბურთალო (მწვანე)' : 'Saburtalo (Green)'}
                >
                  {groupedStations.saburtalo.map((station) => (
                    <option key={station.id} value={station.id}>
                      {isKa ? station.nameKa : station.nameEn}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          ) : null}
        </DeliveryBlock>

        <DeliveryBlock
          active={option === 'home'}
          onSelect={() => onOptionChange('home')}
          title={homeLabel}
          badge={homeBadge}
          badgeTone="paid"
          microcopy={homeMicrocopy}
          ariaControls={homePanelId}
        >
          {option === 'home' ? (
            <div id={homePanelId} className="cm-delivery__panel">
              <label htmlFor="cm-address-input" className="cm-delivery__field-label">
                {isKa ? 'მისამართი' : 'Address'}
              </label>
              <input
                id="cm-address-input"
                type="text"
                className="cm-delivery__input"
                placeholder={addressPlaceholder}
                value={address}
                onChange={(event) => onAddressChange(event.target.value)}
                autoComplete="street-address"
              />
            </div>
          ) : null}
        </DeliveryBlock>
      </div>
    </fieldset>
  );
}

type DeliveryBlockProps = {
  active: boolean;
  onSelect: () => void;
  title: string;
  badge: string;
  badgeTone: 'free' | 'paid';
  microcopy: string;
  ariaControls: string;
  children?: React.ReactNode;
};

function DeliveryBlock({
  active,
  onSelect,
  title,
  badge,
  badgeTone,
  microcopy,
  ariaControls,
  children,
}: DeliveryBlockProps) {
  return (
    <div className={`cm-delivery__block${active ? ' cm-delivery__block--active' : ''}`}>
      <button
        type="button"
        role="radio"
        aria-checked={active}
        aria-controls={ariaControls}
        className="cm-delivery__toggle"
        onClick={onSelect}
      >
        <span className="cm-delivery__marker" aria-hidden>
          <span className="cm-delivery__marker-dot" />
        </span>
        <span className="cm-delivery__toggle-text">
          <span className="cm-delivery__title">{title}</span>
          <span className="cm-delivery__microcopy">{microcopy}</span>
        </span>
        <span
          className={`cm-delivery__badge cm-delivery__badge--${badgeTone}`}
        >
          {badge}
        </span>
      </button>
      {children}
    </div>
  );
}
