import {Link} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {SectionHeading} from '~/components/trailrent/HomeSections';
import {
  IconCompass,
  IconInspect,
  IconMapPin,
  IconShield,
  IconStar,
  IconTent,
} from '~/components/trailrent/Icons';
import {FAQ_ITEMS} from '~/lib/trailrent/faq-content';

const WHY_ITEMS = [
  {Icon: IconInspect, titleKa: 'პროფესიული შემოწმება', titleEn: 'Pro-grade inspection', descKa: 'ყოველი ნივთი იწმინდება და ამოწმება ყოველი გაცემის წინ.', descEn: 'Every item cleaned and inspected before each rental.'},
  {Icon: IconMapPin, titleKa: 'მეტრო hub', titleEn: 'Metro hub pickup', descKa: '6 სადგური თბილისში — აირჩიეთ თქვენთვის მოსახერხებელი.', descEn: '6 Tbilisi stations — pick what works for you.'},
  {Icon: IconShield, titleKa: '0 ₾ დეპოზიტი', titleEn: 'Zero deposit', descKa: 'ID ვერიფიკაცია — ნაღდი არაფერი.', descEn: 'Digital ID check — no cash held.'},
  {Icon: IconStar, titleKa: 'Trusted Tier', titleEn: 'Trusted Tier', descKa: 'სუფთა დაბრუნება = უკეთესი ფასები.', descEn: 'Clean returns = better rates.'},
] as const;

const REVIEWS = [
  {name: 'Nino K.', textKa: 'ტობავარჩხილის კომპლექტი იდეალური იყო — ყველაფერი მზად იყო.', textEn: 'Tobavarchkhili kit was perfect — everything ready to go.', rating: 5},
  {name: 'David M.', textKa: 'მეტროში მიღება ძალიან მოსახერხებელია. დეპოზიტის გარეშე!', textEn: 'Metro pickup is so convenient. No deposit!', rating: 5},
  {name: 'Ana T.', textKa: 'Trail Tested-მა უფასო განახლება მომცა.', textEn: 'Trail Tested tier got me a free upgrade.', rating: 5},
];

export function HowItWorksSection() {
  const {translations: tr} = useLocale();
  const steps = [
    {title: tr.howItWorks.step1, desc: tr.howItWorks.step1Desc},
    {title: tr.howItWorks.step2, desc: tr.howItWorks.step2Desc},
    {title: tr.howItWorks.step3, desc: tr.howItWorks.step3Desc},
    {title: tr.howItWorks.step4, desc: tr.howItWorks.step4Desc},
  ];

  return (
    <section className="cm-content-section">
      <SectionHeading eyebrow={tr.howItWorks.eyebrow} title={tr.howItWorks.title} center />
      <div className="cm-content-grid cm-content-grid--steps">
        {steps.map((step, i) => (
          <article key={step.title} className="cm-step-card">
            <span className="cm-step-card__index">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CategoryGridSection() {
  const {locale} = useLocale();
  const cats = [
    {titleKa: 'კარავები', titleEn: 'Tents', href: '/individual-gear?gear=tent', Icon: IconTent},
    {titleKa: 'რუქსაკები', titleEn: 'Backpacks', href: '/individual-gear?gear=backpack', Icon: IconCompass},
    {titleKa: 'საძილებელი', titleEn: 'Sleeping', href: '/individual-gear?gear=sleeping', Icon: IconStar},
    {titleKa: 'სამზარეულო', titleEn: 'Kitchen', href: '/individual-gear?gear=kitchen', Icon: IconShield},
    {titleKa: 'ნავიგაცია', titleEn: 'Navigation', href: '/individual-gear?gear=navigation', Icon: IconMapPin},
    {titleKa: 'კომპლექტები', titleEn: 'Full kits', href: '/packages', Icon: IconTent},
  ];

  return (
    <section className="tr-section bg-stone/50">
      <div className="tr-page-width">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {cats.map((cat) => (
            <Link
              key={cat.href}
              to={cat.href}
              className="tr-card group flex flex-col items-center justify-center gap-2 p-4 text-center hover:border-moss/50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-forest transition group-hover:bg-pine group-hover:text-mist">
                <cat.Icon size={20} />
              </span>
              <span className="font-display text-sm font-semibold leading-tight md:text-base">
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
    <section className="cm-content-section">
      <SectionHeading eyebrow={tr.whyUs.eyebrow} title={tr.whyUs.title} />
      <div className="cm-why-grid">
        {WHY_ITEMS.map((item) => (
          <article key={item.titleEn} className="cm-why-card">
            <span className="cm-why-card__icon">
              <item.Icon size={22} />
            </span>
            <div>
              <h3>{locale === 'ka' ? item.titleKa : item.titleEn}</h3>
              <p className="cm-doc-lead">
                {locale === 'ka' ? item.descKa : item.descEn}
              </p>
            </div>
          </article>
        ))}
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
          {FAQ_ITEMS.slice(0, 4).map((item) => (
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
        <Link to="/pages/faq" className="cm-link-subtle mt-6 inline-flex items-center gap-2">
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

export function TrustNoticesInline({
  isTrustedTier = false,
}: {
  isTrustedTier?: boolean;
}) {
  const {translations: tr} = useLocale();
  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted">
      {!isTrustedTier ? <span>🛡️ {tr.trust.deposit}</span> : null}
      <span>🚇 {tr.trust.metro}</span>
      <span>⭐ {tr.trust.loyalty}</span>
    </div>
  );
}
