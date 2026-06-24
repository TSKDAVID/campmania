import {useLocale} from '~/providers/LocaleProvider';

const REVIEWS = [
  {
    quoteKa:
      'კომპლექტი იდეალურად შეესაბამებოდა ტობავარჩხილის ტრეკს. მეტროდან მიღება ძალიან მოსახერხებელი იყო.',
    quoteEn:
      'The kit was perfect for Tobavarchkhili. Metro pickup made collection effortless.',
    author: 'Nino K.',
    routeKa: 'ტობავარჩხილი',
    routeEn: 'Tobavarchkhili',
  },
  {
    quoteKa:
      'ყაზბეგში ცივი ღამეები არ შემიშინდა — ძილიან ჩანთა და ტენტი პირველი ხარისხის იყო.',
    quoteEn:
      'Cold nights on Kazbegi were no problem — sleeping bag and tent were top quality.',
    author: 'Giorgi M.',
    routeKa: 'ყაზბეგი',
    routeEn: 'Kazbegi',
  },
  {
    quoteKa:
      'ბირთვისის ერთდღიანი ჰაიკი მარტივად დავგეგმე. ყველაფერი ერთ კომპლექტში.',
    quoteEn:
      'Planned our Birtvisi day hike easily. Everything in one kit.',
    author: 'Ana T.',
    routeKa: 'ბირთვისი',
    routeEn: 'Birtvisi',
  },
];

export function HomeReviewsStrip() {
  const {locale} = useLocale();
  const isKa = locale === 'ka';

  return (
    <section className="cm-reviews-strip" aria-labelledby="home-reviews-heading">
      <h2 id="home-reviews-heading" className="sr-only">
        {isKa ? 'მიმოხილვები' : 'Reviews'}
      </h2>
      <div className="cm-reviews-scroll">
        {REVIEWS.map((review) => (
          <blockquote key={review.author} className="cm-review-card">
            <p className="cm-review-card__quote">
              {isKa ? review.quoteKa : review.quoteEn}
            </p>
            <footer className="cm-review-card__author">
              {review.author} · {isKa ? review.routeKa : review.routeEn}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
