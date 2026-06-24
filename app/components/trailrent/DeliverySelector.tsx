import {useId} from 'react';
import {METRO_STATIONS, getStationLabel} from '~/lib/trailrent/metro';
import {useLocale} from '~/providers/LocaleProvider';

export type DeliveryMode = 'metro' | 'doorstep';

export const DOORSTEP_DELIVERY_FEE = 7;

type DeliverySelectorProps = {
  mode: DeliveryMode;
  onModeChange: (mode: DeliveryMode) => void;
  metroId: string;
  onMetroChange: (metroId: string) => void;
  address: string;
  onAddressChange: (address: string) => void;
};

export function DeliverySelector({
  mode,
  onModeChange,
  metroId,
  onMetroChange,
  address,
  onAddressChange,
}: DeliverySelectorProps) {
  const {locale} = useLocale();
  const metroPanelId = useId();
  const addressPanelId = useId();

  const isKa = locale === 'ka';
  const metroLabel = isKa ? 'მეტროს სადგურზე მიღება' : 'Metro Station Pickup';
  const doorstepLabel = isKa ? 'მისამართზე მიწოდება' : 'Doorstep Delivery';
  const metroFree = isKa ? '0 GEL (უფასო)' : '0 GEL (Free)';
  const doorstepFee = '+7 GEL';
  const addressPlaceholder = isKa ? 'ქუჩა, სახელი, ნომერი' : 'Street address';
  const stationPlaceholder = isKa ? 'აირჩიეთ სადგური' : 'Select station';

  return (
    <div className="cm-delivery-selector" role="group" aria-label={isKa ? 'მიწოდება' : 'Delivery'}>
      <p className="cm-delivery-selector__label">
        {isKa ? 'მიწოდების ტიპი' : 'Delivery method'}
      </p>

      <div className="cm-delivery-selector__options">
        <button
          type="button"
          className={`cm-delivery-option${mode === 'metro' ? ' cm-delivery-option--active' : ''}`}
          aria-pressed={mode === 'metro'}
          aria-controls={metroPanelId}
          onClick={() => onModeChange('metro')}
        >
          <span className="cm-delivery-option__title">{metroLabel}</span>
          <span className="cm-delivery-option__badge cm-delivery-option__badge--free">
            {metroFree}
          </span>
        </button>

        {mode === 'metro' ? (
          <div id={metroPanelId} className="cm-delivery-panel">
            <label htmlFor="cart-metro-select" className="sr-only">
              {stationPlaceholder}
            </label>
            <select
              id="cart-metro-select"
              className="cm-delivery-select"
              value={metroId}
              onChange={(e) => onMetroChange(e.target.value)}
            >
              {METRO_STATIONS.map((station) => (
                <option key={station.id} value={station.id}>
                  {getStationLabel(station, locale)}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <button
          type="button"
          className={`cm-delivery-option${mode === 'doorstep' ? ' cm-delivery-option--active' : ''}`}
          aria-pressed={mode === 'doorstep'}
          aria-controls={addressPanelId}
          onClick={() => onModeChange('doorstep')}
        >
          <span className="cm-delivery-option__title">{doorstepLabel}</span>
          <span className="cm-delivery-option__badge">{doorstepFee}</span>
        </button>

        {mode === 'doorstep' ? (
          <div id={addressPanelId} className="cm-delivery-panel">
            <label htmlFor="cart-address-input" className="sr-only">
              {addressPlaceholder}
            </label>
            <input
              id="cart-address-input"
              type="text"
              className="cm-delivery-input"
              placeholder={addressPlaceholder}
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              autoComplete="street-address"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
