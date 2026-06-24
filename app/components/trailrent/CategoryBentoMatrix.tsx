import {Link} from 'react-router';

type BentoTile = {
  id: string;
  href: string;
  label: string;
  ordinal: string;
  area: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
  icon: 'tent' | 'pack' | 'snow' | 'cook' | 'boots' | 'tools';
  caption?: string;
};

const TILES_KA: BentoTile[] = [
  {
    id: 'tents',
    href: '/individual-gear?gear=tent',
    label: 'კარვები',
    ordinal: '01',
    area: 'a',
    icon: 'tent',
    caption: 'მსუბუქი 2P-დან ექსპედიციამდე',
  },
  {
    id: 'backpacks',
    href: '/individual-gear?gear=backpack',
    label: 'რუქსაკები',
    ordinal: '02',
    area: 'b',
    icon: 'pack',
  },
  {
    id: 'sleeping',
    href: '/individual-gear?gear=sleeping',
    label: 'საძილებლები',
    ordinal: '03',
    area: 'c',
    icon: 'snow',
    caption: 'ყველა სეზონისთვის',
  },
  {
    id: 'kitchen',
    href: '/individual-gear?gear=kitchen',
    label: 'სამზარეულო',
    ordinal: '04',
    area: 'd',
    icon: 'cook',
  },
  {
    id: 'footwear',
    href: '/individual-gear?gear=shoes',
    label: 'ფეხსაცმელი',
    ordinal: '05',
    area: 'e',
    icon: 'boots',
  },
  {
    id: 'tools',
    href: '/individual-gear?gear=poles',
    label: 'ჯოხები და დანამატები',
    ordinal: '06',
    area: 'f',
    icon: 'tools',
    caption: 'ტრეკინგ ჯოხები · ნავიგაცია',
  },
];

export function CategoryBentoMatrix() {
  return (
    <section
      id="home-categories"
      className="cm-bento cm-home-scroll-target"
      aria-labelledby="cm-bento-heading"
    >
      <header className="cm-bento__head">
        <p className="cm-bento__eyebrow">02 — კატეგორიები</p>
        <h2 id="cm-bento-heading" className="cm-bento__title">
          ინდივიდუალური აღჭურვილობა — ნებისმიერი მარშრუტისთვის.
        </h2>
      </header>

      <div className="cm-bento__grid">
        {TILES_KA.map((tile) => (
          <BentoCell key={tile.id} tile={tile} />
        ))}
      </div>
    </section>
  );
}

function BentoCell({tile}: {tile: BentoTile}) {
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
        <h3 className="cm-bento__label">{tile.label}</h3>
        {tile.caption ? (
          <p className="cm-bento__caption">{tile.caption}</p>
        ) : null}
        <span className="cm-bento__cta" aria-hidden>
          ნახე →
        </span>
      </div>
    </Link>
  );
}

const STROKE = '#2A2A2A';

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
