import {useId, useMemo} from 'react';
import {useLocale} from '~/providers/LocaleProvider';

export type DeliveryOption = 'metro' | 'home';

export const HOME_DELIVERY_FEE = 7;

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
  compact?: boolean;
};

export function DeliverySelector({
  option,
  onOptionChange,
  metroStationId,
  onMetroStationChange,
  address,
  onAddressChange,
  compact = false,
}: DeliverySelectorProps) {
  const {locale} = useLocale();
  const isKa = locale === 'ka';
  const metroPanelId = useId();
  const homePanelId = useId();

  const metroLabel = isKa ? 'მეტრო' : 'Metro';
  const homeLabel = isKa ? 'ბინაზე' : 'Door';
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
      {!compact ? (
        <legend className="cm-delivery__legend">
          {isKa ? 'მიწოდება' : 'Delivery'}
        </legend>
      ) : null}

      <div className="cm-delivery__toggle-row">
        <button
          type="button"
          role="radio"
          aria-checked={option === 'metro'}
          aria-controls={metroPanelId}
          className={`cm-delivery__toggle-btn${option === 'metro' ? ' cm-delivery__toggle-btn--active' : ''}`}
          onClick={() => onOptionChange('metro')}
        >
          {metroLabel}
          <span className="text-xs text-muted"> · {isKa ? 'უფასო' : 'free'}</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={option === 'home'}
          aria-controls={homePanelId}
          className={`cm-delivery__toggle-btn${option === 'home' ? ' cm-delivery__toggle-btn--active' : ''}`}
          onClick={() => onOptionChange('home')}
        >
          {homeLabel}
          <span className="text-xs text-muted"> · +7 GEL</span>
        </button>
      </div>

      {option === 'metro' ? (
        <div id={metroPanelId} className="cm-delivery__panel">
          <label htmlFor="cm-metro-select" className="cm-delivery__field-label">
            {isKa ? 'სადგური' : 'Station'}
          </label>
          <select
            id="cm-metro-select"
            className="cm-select"
            value={metroStationId}
            onChange={(event) => onMetroStationChange(event.target.value)}
          >
            <optgroup
              label={isKa ? 'ახმეტელი — ვარკეთილი' : 'Akhmeteli–Varketili'}
            >
              {groupedStations.akhmeteli.map((station) => (
                <option key={station.id} value={station.id}>
                  {isKa ? station.nameKa : station.nameEn}
                </option>
              ))}
            </optgroup>
            <optgroup label={isKa ? 'საბურთალო' : 'Saburtalo'}>
              {groupedStations.saburtalo.map((station) => (
                <option key={station.id} value={station.id}>
                  {isKa ? station.nameKa : station.nameEn}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      ) : null}

      {option === 'home' ? (
        <div id={homePanelId} className="cm-delivery__panel">
          <label htmlFor="cm-address-input" className="cm-delivery__field-label">
            {isKa ? 'მისამართი' : 'Address'}
          </label>
          <input
            id="cm-address-input"
            type="text"
            className="cm-input"
            placeholder={addressPlaceholder}
            value={address}
            onChange={(event) => onAddressChange(event.target.value)}
            autoComplete="street-address"
          />
        </div>
      ) : null}
    </fieldset>
  );
}
