import {Link} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';

type BentoTile = {
  id: string;
  href: string;
  labelKa: string;
  labelEn: string;
  ordinal: string;
  area: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
  icon: 'tent' | 'pack' | 'snow' | 'cook' | 'boots' | 'tools';
  captionKa?: string;
  captionEn?: string;
};

const TILES_KA: BentoTile[] = [
  {
    id: 'tents',
    href: '/individual-gear?gear=tent',
    labelKa: 'კარვები',
    labelEn: 'Tents',
    ordinal: '01',
    area: 'a',
    icon: 'tent',
    captionKa: 'მსუბუქი 2P-დან ექსპედიციამდე',
    captionEn: 'From light 2P to expedition tents',
  },
  {
    id: 'backpacks',
    href: '/individual-gear?gear=backpack',
    labelKa: 'რუქსაკები',
    labelEn: 'Backpacks',
    ordinal: '02',
    area: 'b',
    icon: 'pack',
  },
  {
    id: 'sleeping',
    href: '/individual-gear?gear=sleeping',
    labelKa: 'საძილებლები',
    labelEn: 'Sleeping bags',
    ordinal: '03',
    area: 'c',
    icon: 'snow',
    captionKa: 'ყველა სეზონისთვის',
    captionEn: 'Built for all seasons',
  },
  {
    id: 'kitchen',
    href: '/individual-gear?gear=kitchen',
    labelKa: 'სამზარეულო',
    labelEn: 'Kitchen',
    ordinal: '04',
    area: 'd',
    icon: 'cook',
  },
  {
    id: 'footwear',
    href: '/individual-gear?gear=shoes',
    labelKa: 'ფეხსაცმელი',
    labelEn: 'Footwear',
    ordinal: '05',
    area: 'e',
    icon: 'boots',
  },
  {
    id: 'tools',
    href: '/individual-gear?gear=poles',
    labelKa: 'ჯოხები და დანამატები',
    labelEn: 'Poles and accessories',
    ordinal: '06',
    area: 'f',
    icon: 'tools',
    captionKa: 'ტრეკინგ ჯოხები · ნავიგაცია',
    captionEn: 'Trekking poles · navigation',
  },
];

export function CategoryBentoMatrix() {
  const {locale} = useLocale();
  const isKa = locale === 'ka';

  return (
    <section
      id="home-categories"
      className="cm-bento cm-home-scroll-target"
      aria-labelledby="cm-bento-heading"
    >
      <header className="cm-bento__head">
        <p className="cm-bento__eyebrow">
          {isKa ? '04 — კატეგორიები' : '04 — Categories'}
        </p>
        <h2 id="cm-bento-heading" className="cm-bento__title">
          {isKa
            ? 'ინდივიდუალური აღჭურვილობა — ნებისმიერი მარშრუტისთვის.'
            : 'Pick by category, then build your route-ready setup.'}
        </h2>
      </header>

      <div className="cm-bento__grid">
        {TILES_KA.map((tile) => (
          <BentoCell key={tile.id} tile={tile} isKa={isKa} />
        ))}
      </div>
    </section>
  );
}

function BentoCell({tile, isKa}: {tile: BentoTile; isKa: boolean}) {
  return (
    <Link
      to={tile.href}
      className={`cm-bento__cell cm-bento__cell--${tile.area}`}
      prefetch="intent"
    >
      <span className="cm-bento__ordinal">{tile.ordinal}</span>
      <div className="cm-bento__icon" aria-hidden>
        <BentoIcon kind={tile.icon} />
      </div>
      <div className="cm-bento__foot">
        <h3 className="cm-bento__label">{isKa ? tile.labelKa : tile.labelEn}</h3>
        {tile.captionKa || tile.captionEn ? (
          <p className="cm-bento__caption">
            {isKa ? tile.captionKa : tile.captionEn}
          </p>
        ) : null}
        <span className="cm-bento__cta" aria-hidden>
          {isKa ? 'ნახე →' : 'Explore →'}
        </span>
      </div>
    </Link>
  );
}

const STROKE = '#2A2C24';

function BentoIcon({kind}: {kind: BentoTile['icon']}) {
  switch (kind) {
    case 'tent':
      return (
        <svg viewBox="0 0 80 80" fill="none">
          <path
            d="M10 64 L40 14 L70 64 Z"
            stroke={STROKE}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M40 14 L40 64" stroke={STROKE} strokeWidth="1.5" />
          <path d="M22 64 L58 64" stroke={STROKE} strokeWidth="1.5" />
        </svg>
      );
    case 'pack':
      return (
        <svg viewBox="0 0 80 80" fill="none">
          <rect
            x="22"
            y="22"
            width="36"
            height="46"
            rx="2"
            stroke={STROKE}
            strokeWidth="1.5"
          />
          <path d="M30 22 L30 14 L50 14 L50 22" stroke={STROKE} strokeWidth="1.5" />
          <path d="M22 40 L58 40" stroke={STROKE} strokeWidth="1.5" />
          <path d="M30 52 L50 52" stroke={STROKE} strokeWidth="1.2" />
        </svg>
      );
    case 'snow':
      return (
        <svg viewBox="0 0 80 80" fill="none">
          <rect
            x="12"
            y="28"
            width="56"
            height="28"
            rx="14"
            stroke={STROKE}
            strokeWidth="1.5"
          />
          <path d="M40 28 L40 56" stroke={STROKE} strokeWidth="1.2" />
          <path d="M22 42 L58 42" stroke={STROKE} strokeWidth="1.2" />
        </svg>
      );
    case 'cook':
      return (
        <svg viewBox="0 0 80 80" fill="none">
          <ellipse cx="40" cy="56" rx="24" ry="6" stroke={STROKE} strokeWidth="1.5" />
          <path
            d="M16 56 C16 38 28 28 40 28 C52 28 64 38 64 56"
            stroke={STROKE}
            strokeWidth="1.5"
          />
          <path d="M30 20 L50 20" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'boots':
      return (
        <svg viewBox="0 0 80 80" fill="none">
          <path
            d="M22 16 L22 50 L18 50 L18 62 L60 62 L60 54 C60 50 56 48 50 48 L40 48 L40 16 Z"
            stroke={STROKE}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M40 30 L46 30" stroke={STROKE} strokeWidth="1.2" />
          <path d="M40 38 L48 38" stroke={STROKE} strokeWidth="1.2" />
        </svg>
      );
    case 'tools':
      return (
        <svg viewBox="0 0 80 80" fill="none">
          <path d="M24 12 L24 64" stroke={STROKE} strokeWidth="1.5" />
          <path d="M56 16 L56 68" stroke={STROKE} strokeWidth="1.5" />
          <path d="M20 64 L28 70" stroke={STROKE} strokeWidth="1.5" />
          <path d="M52 68 L60 74" stroke={STROKE} strokeWidth="1.5" />
          <path d="M24 28 L56 28" stroke={STROKE} strokeWidth="1.2" />
        </svg>
      );
    default:
      return null;
  }
}
