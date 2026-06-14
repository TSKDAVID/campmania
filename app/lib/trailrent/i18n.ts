export type Locale = 'ka' | 'en';

export const DEFAULT_LOCALE: Locale = 'ka';

export type TranslationKey = keyof typeof translations.ka;

const translations = {
  ka: {
    brand: 'Campmania',
    tagline: 'პრემიუმ ლაშქრობის აღჭურვილობის ქირა — თბილისი',
    announcement:
      'მეტროში მიღება · 0 ₾ დეპოზიტი · Trusted Tier პროგრამა',
    nav: {
      packages: 'ბილიკის კომპლექტები',
      gear: 'ინდივიდუალური აღჭურვილობა',
      howItWorks: 'როგორ მუშაობს',
      faq: 'FAQ',
      account: 'ანგარიში',
      cart: 'კალათა',
      search: 'ძიება',
    },
    hero: {
      eyebrow: 'საქართველოს ბუნებაში',
      title: 'თქვენი შემდეგი სათავგადასავლო — სრულად მომზადებული.',
      subtitle:
        'სრული trail კომპლექტები ან ინდივიდუალური აღჭურვილობა — მეტროს გაჩვენებაზე მიღება, ციფრული ID-ით დადასტურება, 0 ₾ ნაღდი დეპოზიტი.',
      ctaPackages: 'სრული კომპლექტის ქირა',
      ctaGear: 'ინდივიდუალური აღჭურვილობა',
      statRating: '4.9★ რეიტინგი',
      statRenters: '500+ მომხმარებელი',
      statDeposit: '0 ₾ დეპოზიტი',
    },
    intent: {
      leftTitle: 'სრული ბილიკის კომპლექტის ქირა',
      leftDesc: 'ტობავარჩხილი, ბირთვისი, კაზბეგი — ყველაფერი ერთ პაკეტში.',
      rightTitle: 'ინდივიდუალური აღჭურვილობის ნახვა',
      rightDesc: 'ანსამბლი, რუქსაკი, საძილებელი — აირჩიეთ რაც გჭირდებათ.',
    },
    trust: {
      metro: 'მეტრო hub მიღება',
      metroDesc: 'აღჭურვილობა გადაგეცემათ უახლოესი სადგურის გასასვლელში.',
      deposit: '0 ₾ ნაღდი დეპოზიტი',
      depositDesc: 'ციფრული ID-ის შემოწმების შემდეგ — მყისიერი დაჯავშნა.',
      loyalty: 'Trusted Tier',
      loyaltyDesc: 'სუფთა დაბრუნება — უკეთესი ფასები და პრიორიტეტი.',
    },
    howItWorks: {
      eyebrow: '4 ნაბიჯი',
      title: 'როგორ მუშაობს',
      step1: 'აირჩიეთ აღჭურვილობა',
      step1Desc: 'კომპლექტი ან ცალკეული ნივთი — დააკონფიგურირეთ თარიღები.',
      step2: 'ID ვერიფიკაცია',
      step2Desc: 'ციფრული პირადობის დადასტურება — დეპოზიტის გარეშე.',
      step3: 'მეტროში მიღება',
      step3Desc: 'აირჩიეთ სადგური და დრო — გადაგეცემათ აღჭურვილობა.',
      step4: 'სუფთა დაბრუნება',
      step4Desc: 'უფასო დაბრუნება — Trusted Tier პროგრესი.',
    },
    whyUs: {
      eyebrow: 'რატომ Campmania',
      title: 'პრემიუმ გამოცდილება, უბრალო პროცესი',
    },
    reviews: {
      eyebrow: 'მომხმარებლები',
      title: 'რას ამბობენ მოგზაურები',
    },
    faq: {
      eyebrow: 'კითხვები',
      title: 'ხშირად დასმული კითხვები',
      viewAll: 'ყველა კითხვა',
    },
    cta: {
      title: 'მზად ხართ შემდეგი ბილიკისთვის?',
      subtitle: 'დაჯავშნეთ ახლა — მეტროში მიღება უკვე 24 საათში.',
      button: 'კომპლექტების ნახვა',
    },
    featured: {
      eyebrow: 'Shopify კატალოგი',
      title: 'რჩეული აღჭურვილობა',
      subtitle: 'პრემიუმ ნივთები პირდაპირ ჩვენი მაღაზიიდან — აირჩიეთ და დაჯავშნეთ.',
      viewAll: 'ყველა პროდუქტი',
      empty: 'პროდუქტები მალე გამოჩნდება — დაამატეთ ნივთები Shopify Admin-ში.',
    },
    packages: {
      eyebrow: 'ბილიკის კომპლექტები',
      title: 'Trail კომპლექტები',
      subtitle:
        'აირჩიეთ ბილიკი და ხანგრძლივობა — თითოეული კომპლექტი შეიცავს ყველა საჭირო აღჭურვილობას.',
      filters: 'ფილტრები',
      clearAll: 'გასუფთავება',
      showing: 'ნაჩვენებია',
      noResults: 'კომპლექტები ვერ მოიძებნა',
      included: 'რა შედის',
      bookKit: 'კომპლექტის დაჯავშნა',
    },
    gear: {
      eyebrow: 'à la carte',
      title: 'ინდივიდუალური აღჭურვილობა',
      subtitle: 'აირჩიეთ კონკრეტული ნივთები — დაამატეთ თქვენს კომპლექტს.',
      bookItem: 'დაჯავშნა',
    },
    booking: {
      title: 'ქირის დაჯავშნა',
      dates: 'თარიღები',
      startDate: 'დაწყება',
      endDate: 'დასრულება',
      metro: 'მეტრო სადგური',
      metroPlaceholder: 'აირჩიეთ სადგური',
      pickupWindow: 'მიღების დრო',
      days: 'დღე',
      dailyRate: 'დღიური ფასი',
      total: 'სულ',
      idNotice: 'დაჯავშნის შემდეგ გაივლით ციფრული ID ვერიფიკაციას — 0 ₾ დეპოზიტი.',
      confirm: 'ხელმისაწვდომობის შემოწმება და დაჯავშნა',
      close: 'დახურვა',
      unavailable: 'მიუწვდომელია',
      modeRent: 'ქირა',
      modeBuy: 'ყიდვა (Rent-to-Own)',
      buyNow: 'ყიდვა ახლა',
      buyNowDiscount: 'ქირის ფასის ფასდაკლებით',
      rentalCredit: 'ქირის კრედიტი',
      addToCart: 'კალათაში დამატება',
    },
    loyalty: {
      eyebrow: 'Trusted Tier',
      title: 'სანდოობის პროგრამა',
      explorer: 'Explorer',
      trailTested: 'Trail Tested',
      verified: 'ვერიფიცირებული',
      progress: 'პროგრესი',
      oneMoreReturn: 'კიდევ 1 სუფთა დაბრუნება Trail Tested-მდე',
      benefits:
        '0 ₾ დეპოზიტი · პრიორიტეტული დაჯავშნა · უფასო აფგრეიდები',
      cleanReturns: 'სუფთა დაბრუნებები',
      demoToggle: 'დემო: Tier-ის გადართვა',
    },
    cart: {
      title: 'თქვენი ქირის კალათა',
      pickupNote: 'მეტრო / მიღების დეტალები',
      agreement: 'ვეთანხმები ქირის ხელშეკრულებას',
      deliveryNote: 'მეტროს გაჩვენება · უფასო დაბრუნება',
    },
    product: {
      specs: 'მახასიათებლები',
      included: 'რა შედის',
      completeKit: 'დაასრულეთ კომპლექტი',
    },
    footer: {
      rent: 'ქირა',
      support: 'მხარდაჭერა',
      contact: 'კონტაქტი',
      hours: 'მეტროში მიღება: სამ–შაბ, 10:00–20:00',
    },
    pages: {
      howItWorks: 'როგორ მუშაობს',
      delivery: 'მიწოდება',
      faq: 'FAQ',
      contact: 'კონტაქტი',
      about: 'ჩვენს შესახებ',
      pricing: 'ფასები',
    },
  },
  en: {
    brand: 'Campmania',
    tagline: 'Premium hiking gear rental — Tbilisi',
    announcement:
      'Metro hub pickup · 0 GEL deposit · Trusted Tier rewards',
    nav: {
      packages: 'Trail packages',
      gear: 'Individual gear',
      howItWorks: 'How it works',
      faq: 'FAQ',
      account: 'Account',
      cart: 'Cart',
      search: 'Search',
    },
    hero: {
      eyebrow: 'Explore Georgia',
      title: 'Your Next Adventure, Fully Packed',
      subtitle:
        'Complete trail kits or à-la-carte gear — metro hub pickup, digital ID verification, zero cash deposit.',
      ctaPackages: 'Rent a complete kit',
      ctaGear: 'Browse individual gear',
      statRating: '4.9★ rating',
      statRenters: '500+ renters',
      statDeposit: '0 GEL deposit',
    },
    intent: {
      leftTitle: 'Rent Complete Trail Packages',
      leftDesc: 'Tobavarchkhili, Birtvisi, Kazbegi — everything in one kit.',
      rightTitle: 'Browse Individual Gear',
      rightDesc: 'Tent, backpack, sleeping bag — pick exactly what you need.',
    },
    trust: {
      metro: 'Metro hub pickup',
      metroDesc: 'Gear handed at your nearest station exit.',
      deposit: 'Zero cash deposit',
      depositDesc: 'Instant booking after digital ID check.',
      loyalty: 'Trusted Tier',
      loyaltyDesc: 'Clean returns unlock better rates and priority.',
    },
    howItWorks: {
      eyebrow: '4 steps',
      title: 'How it works',
      step1: 'Choose gear',
      step1Desc: 'Kit or individual item — configure your dates.',
      step2: 'ID verification',
      step2Desc: 'Digital ID check — no deposit required.',
      step3: 'Metro pickup',
      step3Desc: 'Pick station and time — collect your gear.',
      step4: 'Clean return',
      step4Desc: 'Free return — Trusted Tier progress.',
    },
    whyUs: {
      eyebrow: 'Why Campmania',
      title: 'Premium experience, simple process',
    },
    reviews: {
      eyebrow: 'Reviews',
      title: 'What hikers say',
    },
    faq: {
      eyebrow: 'Questions',
      title: 'Frequently asked',
      viewAll: 'View all FAQ',
    },
    cta: {
      title: 'Ready for your next trail?',
      subtitle: 'Book now — metro pickup within 24 hours.',
      button: 'Browse packages',
    },
    featured: {
      eyebrow: 'Live inventory',
      title: 'Featured gear',
      subtitle: 'Premium rental items pulled directly from our Shopify store.',
      viewAll: 'View all products',
      empty: 'Products coming soon — add items in Shopify Admin.',
    },
    packages: {
      eyebrow: 'Trail packages',
      title: 'Complete kits',
      subtitle:
        'Filter by trek and duration — each kit includes everything you need.',
      filters: 'Filters',
      clearAll: 'Clear all',
      showing: 'Showing',
      noResults: 'No packages found',
      included: 'Included',
      bookKit: 'Book this kit',
    },
    gear: {
      eyebrow: 'À la carte',
      title: 'Individual gear',
      subtitle: 'Pick specific items — add to your kit.',
      bookItem: 'Book item',
    },
    booking: {
      title: 'Book rental',
      dates: 'Dates',
      startDate: 'Start',
      endDate: 'End',
      metro: 'Metro station',
      metroPlaceholder: 'Select station',
      pickupWindow: 'Pickup window',
      days: 'days',
      dailyRate: 'Daily rate',
      total: 'Total',
      idNotice:
        'After booking you will complete digital ID verification — 0 GEL deposit.',
      confirm: 'Check availability & book',
      close: 'Close',
      unavailable: 'Unavailable',
      modeRent: 'Rent',
      modeBuy: 'Buy (Rent-to-Own)',
      buyNow: 'Buy It Now for',
      buyNowDiscount: 'with rental credit applied',
      rentalCredit: 'Rental credit',
      addToCart: 'Add to cart',
    },
    loyalty: {
      eyebrow: 'Trusted Tier',
      title: 'Loyalty program',
      explorer: 'Explorer',
      trailTested: 'Trail Tested',
      verified: 'Verified',
      progress: 'Progress',
      oneMoreReturn: '1 more clean return to Trail Tested',
      benefits:
        '0 GEL deposit · Priority booking · Free upgrades',
      cleanReturns: 'Clean returns',
      demoToggle: 'Demo: toggle tier',
    },
    cart: {
      title: 'Your rental cart',
      pickupNote: 'Metro / pickup details',
      agreement: 'I agree to the rental agreement',
      deliveryNote: 'Metro hub pickup · Free return',
    },
    product: {
      specs: 'Specifications',
      included: "What's included",
      completeKit: 'Complete your kit',
    },
    footer: {
      rent: 'Rent',
      support: 'Support',
      contact: 'Contact',
      hours: 'Metro pickup: Tue–Sat, 10:00–20:00',
    },
    pages: {
      howItWorks: 'How it works',
      delivery: 'Delivery',
      faq: 'FAQ',
      contact: 'Contact',
      about: 'About',
      pricing: 'Pricing',
    },
  },
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale] ?? translations.ka;
}

export function t(locale: Locale, key: string): string {
  const dict = getTranslations(locale) as Record<string, unknown>;
  const parts = key.split('.');
  let value: unknown = dict;
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof value === 'string' ? value : key;
}
