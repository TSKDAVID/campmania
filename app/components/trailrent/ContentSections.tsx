import {Link} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {SectionHeading} from '~/components/trailrent/HomeSections';

const WHY_ITEMS = [
  {icon: '🔍', titleKa: 'პროფესიული შემოწმება', titleEn: 'Pro-grade inspection', descKa: 'ყოველი ნივთი იწმინდება და ამოწმება ყოველი გაცემის წინ.', descEn: 'Every item cleaned and inspected before each rental.'},
  {icon: '📍', titleKa: 'მეტრო hub', titleEn: 'Metro hub pickup', descKa: '6 სადგური თბილისში — აირჩიეთ თქვენთვის მოსახერხებელი.', descEn: '6 Tbilisi stations — pick what works for you.'},
  {icon: '💳', titleKa: '0 ₾ დეპოზიტი', titleEn: 'Zero deposit', descKa: 'ID ვერიფიკაცია — ნაღდი არაფერი.', descEn: 'Digital ID check — no cash held.'},
  {icon: '⭐', titleKa: 'Trusted Tier', titleEn: 'Trusted Tier', descKa: 'სუფთა დაბრუნება = უკეთესი ფასები.', descEn: 'Clean returns = better rates.'},
];

const REVIEWS = [
  {name: 'Nino K.', textKa: 'ტობავარჩხილის კომპლექტი იდეალური იყო — ყველაფერი მზად იყო.', textEn: 'Tobavarchkhili kit was perfect — everything ready to go.', rating: 5},
  {name: 'David M.', textKa: 'მეტროში მიღება ძალიან მოსახერხებელია. დეპოზიტის გარეშე!', textEn: 'Metro pickup is so convenient. No deposit!', rating: 5},
  {name: 'Ana T.', textKa: 'Trail Tested-მა უფასო განახლება მომცა.', textEn: 'Trail Tested tier got me a free upgrade.', rating: 5},
];

const FAQ_ITEMS = [
  {qKa: 'როგორ მუშაობს დეპოზიტის გარეშე ქირა?', qEn: 'How does zero-deposit rental work?', aKa: 'ციფრული ID ვერიფიკაციის შემდეგ დაუყოვნებლივ ჯავშნავთ.', aEn: 'After digital ID verification you book instantly.'},
  {qKa: 'სად ვიღებ აღჭურვილობას?', qEn: 'Where do I pick up gear?', aKa: 'უახლოეს მეტროს გასასვლელში — აირჩევთ სადგურს დაჯავშნისას.', aEn: 'At your nearest metro exit — choose station when booking.'},
  {qKa: 'რა არის Trusted Tier?', qEn: 'What is Trusted Tier?', aKa: 'სუფთა დაბრუნებები გაძლ�ევთ Trail Tested სტატუსს.', aEn: 'Clean returns unlock Trail Tested status.'},
  {qKa: 'როგორ დავაბრუნო?', qEn: 'How do I return?', aKa: 'უფასო დაბრუნება იმავე მეტრო hub-ზე.', aEn: 'Free return at the same metro hub.'},
];

export function HowItWorksSection() {
  const {locale, translations: tr} = useLocale();
  const steps = [
    {title: tr.howItWorks.step1, desc: tr.howItWorks.step1Desc},
    {title: tr.howItWorks.step2, desc: tr.howItWorks.step2Desc},
    {title: tr.howItWorks.step3, desc: tr.howItWorks.step3Desc},
    {title: tr.howItWorks.step4, desc: tr.howItWorks.step4Desc},
  ];

  return (
    <section className="tr-section bg-white">
      <div className="tr-page-width">
        <SectionHeading eyebrow={tr.howItWorks.eyebrow} title={tr.howItWorks.title} center />
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="tr-card p-5">
              <span className="text-3xl font-bold text-amber/60">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoryGridSection() {
  const {locale} = useLocale();
  const cats = [
    {titleKa: 'ანსამბლები', titleEn: 'Tents', href: '/individual-gear?gear=tent'},
    {titleKa: 'რუქსაკები', titleEn: 'Backpacks', href: '/individual-gear?gear=backpack'},
    {titleKa: 'საძილებელი', titleEn: 'Sleeping', href: '/individual-gear?gear=sleeping'},
    {titleKa: 'სამზარეულო', titleEn: 'Kitchen', href: '/individual-gear?gear=kitchen'},
    {titleKa: 'ნავიგაცია', titleEn: 'Navigation', href: '/individual-gear?gear=navigation'},
    {titleKa: 'კომპლექტები', titleEn: 'Full kits', href: '/packages'},
  ];

  return (
    <section className="tr-section bg-stone/50">
      <div className="tr-page-width">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {cats.map((cat) => (
            <Link
              key={cat.href}
              to={cat.href}
              className="tr-card flex aspect-square flex-col items-center justify-center p-4 text-center hover:border-moss"
            >
              <span className="font-display text-lg font-semibold">
                {locale === 'ka' ? cat.titleKa : cat.titleEn}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyUsSection() {
  const {locale, translations: tr} = useLocale();

  return (
    <section className="tr-section">
      <div className="tr-page-width">
        <SectionHeading eyebrow={tr.whyUs.eyebrow} title={tr.whyUs.title} />
        <div className="grid gap-6 md:grid-cols-2">
          {WHY_ITEMS.map((item) => (
            <div key={item.titleEn} className="flex gap-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="font-display text-lg font-semibold">
                  {locale === 'ka' ? item.titleKa : item.titleEn}
                </h3>
                <p className="mt-1 text-muted">
                  {locale === 'ka' ? item.descKa : item.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReviewsSection() {
  const {locale, translations: tr} = useLocale();

  return (
    <section className="tr-section bg-pine text-mist">
      <div className="tr-page-width">
        <SectionHeading
          eyebrow={tr.reviews.eyebrow}
          title={tr.reviews.title}
          center
        />
        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <blockquote
              key={r.name}
              className="rounded-md border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <p className="text-amber">{'★'.repeat(r.rating)}</p>
              <p className="mt-3 leading-relaxed text-sage">
                {locale === 'ka' ? r.textKa : r.textEn}
              </p>
              <footer className="mt-4 text-sm font-semibold">{r.name}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const {locale, translations: tr} = useLocale();

  return (
    <section className="tr-section bg-white">
      <div className="tr-page-width">
        <SectionHeading eyebrow={tr.faq.eyebrow} title={tr.faq.title} />
        <div className="divide-y divide-stone border-y border-stone">
          {FAQ_ITEMS.map((item) => (
            <details key={item.qEn} className="group py-4">
              <summary className="cursor-pointer list-none font-semibold marker:content-none">
                {locale === 'ka' ? item.qKa : item.qEn}
              </summary>
              <p className="mt-2 text-muted">
                {locale === 'ka' ? item.aKa : item.aEn}
              </p>
            </details>
          ))}
        </div>
        <Link to="/pages/faq" className="mt-6 inline-block text-moss underline">
          {tr.faq.viewAll}
        </Link>
      </div>
    </section>
  );
}

export function CtaSection() {
  const {translations: tr} = useLocale();

  return (
    <section className="tr-section bg-gradient-to-r from-forest to-pine text-mist">
      <div className="tr-page-width text-center">
        <h2 className="font-display text-3xl font-bold text-mist md:text-4xl">
          {tr.cta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sage">{tr.cta.subtitle}</p>
        <Link to="/packages" className="tr-btn-primary mt-8 inline-flex bg-amber text-pine hover:bg-amber/90">
          {tr.cta.button}
        </Link>
      </div>
    </section>
  );
}

export function TrustNoticesInline() {
  const {translations: tr} = useLocale();
  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted">
      <span>🛡️ {tr.trust.deposit}</span>
      <span>🚇 {tr.trust.metro}</span>
      <span>⭐ {tr.trust.loyalty}</span>
    </div>
  );
}
