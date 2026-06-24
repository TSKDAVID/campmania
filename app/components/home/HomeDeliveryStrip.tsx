import {useLocale} from '~/providers/LocaleProvider';

export function HomeDeliveryStrip() {
  const {locale} = useLocale();
  const isKa = locale === 'ka';

  return (
    <section className="cm-delivery-strip" aria-label={isKa ? 'მიწოდება' : 'Delivery'}>
      <div className="cm-delivery-strip__item">
        {isKa ? 'მეტროდან მიღება — უფასო' : 'Metro pickup — free'}
      </div>
      <div className="cm-delivery-strip__item">
        {isKa ? 'ბინაზე მიწოდება — +ფასი' : 'Door delivery — +charge'}
      </div>
    </section>
  );
}
