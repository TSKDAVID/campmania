export type PackageItem = {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  dailyRate: number;
  currency: string;
  trek: string;
  trekLabel: string;
  duration: string;
  durationLabel: string;
  difficulty: string;
  difficultyLabel: string;
  image?: string;
  productHandle?: string;
  items: string[];
};

export type GearItem = {
  id: string;
  title: string;
  subtitle: string;
  priceLabel: string;
  dailyRate: number;
  currency: string;
  category: string;
  categoryLabel: string;
  image?: string;
  productHandle?: string;
};

export const TREK_FILTERS = [
  {value: 'tobavarchkhili', labelKa: 'ტობავარჩხილი', labelEn: 'Tobavarchkhili'},
  {value: 'birtvisi', labelKa: 'ბირთვისი', labelEn: 'Birtvisi'},
  {value: 'kazbegi', labelKa: 'კაზბეგი', labelEn: 'Kazbegi'},
] as const;

export const DURATION_FILTERS = [
  {value: '1-day', labelKa: '1 დღე', labelEn: '1 day'},
  {value: '2-day', labelKa: '2 დღე', labelEn: '2 days'},
  {value: 'weekend', labelKa: 'Weekend', labelEn: 'Weekend'},
] as const;

export const DIFFICULTY_FILTERS = [
  {value: 'easy', labelKa: 'მარტივი', labelEn: 'Easy'},
  {value: 'moderate', labelKa: 'საშუალო', labelEn: 'Moderate'},
  {value: 'hard', labelKa: 'რთული', labelEn: 'Hard'},
] as const;

export const GEAR_FILTERS = [
  {value: 'tent', labelKa: 'კარავი', labelEn: 'Tent'},
  {value: 'sleeping', labelKa: 'საძილებელი', labelEn: 'Sleeping'},
  {value: 'backpack', labelKa: 'რუქსაკი', labelEn: 'Backpack'},
  {value: 'kitchen', labelKa: 'სამზარეულო', labelEn: 'Kitchen'},
  {value: 'navigation', labelKa: 'ნავიგაცია', labelEn: 'Navigation'},
  {value: 'electronics', labelKa: 'ელექტრონიკა', labelEn: 'Electronics'},
] as const;

export const TRAIL_PACKAGES: PackageItem[] = [
  {
    id: 'pkg-tobavarchkhili',
    title: 'ტობავარჩხილი — Weekend Kit',
    description: '2-დღიანი ლაშქრობის სრული კომპლექტი.',
    priceLabel: '₾95 / დღე',
    dailyRate: 95,
    currency: 'GEL',
    trek: 'tobavarchkhili',
    trekLabel: 'ტობავარჩხილი',
    duration: '2-day',
    durationLabel: '2 დღე',
    difficulty: 'moderate',
    difficultyLabel: 'საშუალო',
    productHandle: 'tobavarchkhili-weekend-kit',
    items: [
      '2 ადამიანის კარავი',
      'საძილებელი ჩანთა -5°C',
      'მომზადების ღუმელი',
      'HEAD ფანარი',
      'დასაფენი',
      'საჭმლის ნაკრები',
    ],
  },
  {
    id: 'pkg-birtvisi',
    title: 'ბირთვისი — Day Hike Kit',
    description: '1-დღიანი ბილიკისთვის — მსუბუქი და სწრაფი.',
    priceLabel: '₾55 / დღე',
    dailyRate: 55,
    currency: 'GEL',
    trek: 'birtvisi',
    trekLabel: 'ბირთვისი',
    duration: '1-day',
    durationLabel: '1 დღე',
    difficulty: 'easy',
    difficultyLabel: 'მარტივი',
    productHandle: 'birtvisi-day-hike-kit',
    items: [
      '20L რუქსაკი',
      'სავაჭრო ჯოხები',
      'წყლის ფილტრი',
      'საჭმლის ნაკრები',
    ],
  },
  {
    id: 'pkg-kazbegi',
    title: 'კაზბეგი — Alpine Kit',
    description: '3-დღიანი ალპური ლაშქრობის კომპლექტი.',
    priceLabel: '₾120 / დღე',
    dailyRate: 120,
    currency: 'GEL',
    trek: 'kazbegi',
    trekLabel: 'კაზბეგი',
    duration: 'weekend',
    durationLabel: 'Weekend',
    difficulty: 'hard',
    difficultyLabel: 'რთული',
    productHandle: 'kazbegi-alpine-kit',
    items: [
      '3 ადამიანის 4-სეზონიანი კარავი',
      'საძილებელი -10°C',
      '60L რუქსაკი',
      'გაზის ღუმელი',
      'ფანარი + სათავსური',
      'GPS მოწყობილობა',
    ],
  },
];

export const INDIVIDUAL_GEAR: GearItem[] = [
  {
    id: 'gear-tent-2p',
    title: '2-Person Tent',
    subtitle: 'MSR Hubba Hubba — trail tested',
    priceLabel: '₾45 / დღე',
    dailyRate: 45,
    currency: 'GEL',
    category: 'tent',
    categoryLabel: 'კარავი',
    productHandle: '2-person-tent',
  },
  {
    id: 'gear-sleeping-5',
    title: 'Sleeping Bag -5°C',
    subtitle: 'Down fill · compressible',
    priceLabel: '₾35 / დღე',
    dailyRate: 35,
    currency: 'GEL',
    category: 'sleeping',
    categoryLabel: 'საძილებელი',
    productHandle: 'sleeping-bag-minus-5',
  },
  {
    id: 'gear-backpack-40',
    title: '40L Backpack',
    subtitle: 'Osprey · adjustable fit',
    priceLabel: '₾25 / დღე',
    dailyRate: 25,
    currency: 'GEL',
    category: 'backpack',
    categoryLabel: 'რუქსაკი',
    productHandle: '40l-backpack',
  },
  {
    id: 'gear-stove',
    title: 'Camping Stove Kit',
    subtitle: 'Gas + pot + utensils',
    priceLabel: '₾20 / დღე',
    dailyRate: 20,
    currency: 'GEL',
    category: 'kitchen',
    categoryLabel: 'სამზარეულო',
    productHandle: 'camping-stove-kit',
  },
  {
    id: 'gear-headlamp',
    title: 'Headlamp Pro',
    subtitle: '300lm · rechargeable',
    priceLabel: '₾12 / დღე',
    dailyRate: 12,
    currency: 'GEL',
    category: 'electronics',
    categoryLabel: 'ელექტრონიკა',
    productHandle: 'headlamp-pro',
  },
  {
    id: 'gear-gps',
    title: 'GPS Navigator',
    subtitle: 'Garmin · preloaded maps',
    priceLabel: '₾30 / დღე',
    dailyRate: 30,
    currency: 'GEL',
    category: 'navigation',
    categoryLabel: 'ნავიგაცია',
    productHandle: 'gps-navigator',
  },
];

export function filterPackages(
  packages: PackageItem[],
  filters: {trek?: string; duration?: string; difficulty?: string},
) {
  return packages.filter((pkg) => {
    if (filters.trek && pkg.trek !== filters.trek) return false;
    if (filters.duration && pkg.duration !== filters.duration) return false;
    if (filters.difficulty && pkg.difficulty !== filters.difficulty)
      return false;
    return true;
  });
}

export function filterGear(gear: GearItem[], category?: string) {
  if (!category) return gear;
  return gear.filter((item) => item.category === category);
}
