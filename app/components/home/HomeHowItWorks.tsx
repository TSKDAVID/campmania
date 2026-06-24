import {useLocale} from '~/providers/LocaleProvider';

const STEPS = [
  {
    num: '01',
    titleKa: 'აირჩიე კომპლექტი',
    titleEn: 'Choose your kit',
    descKa: 'შეარჩიე მზა კომპლექტი ან ცალკეული აღჭურვილობა თავისუფალი თარიღებით.',
    descEn: 'Pick a ready-made kit or individual gear with flexible rental dates.',
  },
  {
    num: '02',
    titleKa: 'დაჯავშნე ონლაინ',
    titleEn: 'Book online',
    descKa: 'აირჩიე მეტროსადგური ან ბინაზე მიწოდება. გადახდა ჩეკაუთზე.',
    descEn: 'Select metro pickup or door delivery. Pay at checkout.',
  },
  {
    num: '03',
    titleKa: 'გაემგზავრე',
    titleEn: 'Hit the trail',
    descKa: 'მიიღე აღჭურვილობა, დატოვე ბუნებაში კვალს და დააბრუნე მარტივად.',
    descEn: 'Collect your gear, explore Georgia, return with ease.',
  },
];

export function HomeHowItWorks() {
  const {locale} = useLocale();
  const isKa = locale === 'ka';

  return (
    <section className="cm-home-section" aria-labelledby="home-steps-heading">
      <div className="cm-container">
        <h2 id="home-steps-heading" className="sr-only">
          {isKa ? 'როგორ მუშაობს' : 'How it works'}
        </h2>
        <div className="cm-steps">
          {STEPS.map((step) => (
            <div key={step.num} className="cm-steps__step">
              <p className="cm-steps__num">{step.num}</p>
              <h3 className="cm-steps__title">
                {isKa ? step.titleKa : step.titleEn}
              </h3>
              <p className="cm-steps__desc">
                {isKa ? step.descKa : step.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
