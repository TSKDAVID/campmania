import {useLocale} from '~/providers/LocaleProvider';

const TICKER_ITEMS_KA = [
  'უფასო მიწოდება მეტროსადგურებთან',
  'პროფესიონალური აღჭურვილობა',
  'მარტივი ჯავშანი',
  'სრული სალაშქრო და სამთო ნაკრებები',
];

const TICKER_ITEMS_EN = [
  'Reliable trail equipment',
  'Curated kits for Caucasus routes',
  'Fast booking and metro pickup',
  'Premium camping gear, inspected each time',
];

export function BrandTicker() {
  const {locale} = useLocale();
  const items = locale === 'ka' ? TICKER_ITEMS_KA : TICKER_ITEMS_EN;

  return (
    <div className="cm-ticker" role="marquee" aria-label="Camp Mania highlights">
      <div className="cm-ticker__track" aria-hidden>
        {[0, 1].map((loop) => (
          <ul key={loop} className="cm-ticker__list">
            {items.map((item) => (
              <li key={`${loop}-${item}`} className="cm-ticker__item">
                <span className="cm-ticker__dot" aria-hidden>
                  ✦
                </span>
                <span className="cm-ticker__text">{item}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
