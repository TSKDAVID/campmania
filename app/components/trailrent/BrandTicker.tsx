const TICKER_ITEMS_KA = [
  'უფასო მიწოდება მეტროსადგურებთან',
  'პროფესიონალური აღჭურვილობა',
  'მარტივი ჯავშანი',
  'სრული სალაშქრო და სამთო ნაკრებები',
];

export function BrandTicker() {
  return (
    <div className="cm-ticker" role="marquee" aria-label="Camp Mania highlights">
      <div className="cm-ticker__track" aria-hidden>
        {[0, 1].map((loop) => (
          <ul key={loop} className="cm-ticker__list">
            {TICKER_ITEMS_KA.map((item, index) => (
              <li key={`${loop}-${index}`} className="cm-ticker__item">
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
        {TICKER_ITEMS_KA.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
