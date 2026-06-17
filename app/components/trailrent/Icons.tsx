import type {ReactNode} from 'react';

type IconProps = {
  className?: string;
  size?: number;
};

function Icon({
  className = '',
  size = 20,
  children,
  viewBox = '0 0 24 24',
}: IconProps & {children: ReactNode; viewBox?: string}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconMenu(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 7h14M5 12h14M5 17h10" {...stroke} />
    </Icon>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" {...stroke} />
      <path d="M16 16l4.5 4.5" {...stroke} />
    </Icon>
  );
}

export function IconBag(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 7.5h12l-1.2 10.5H7.2L6 7.5z" {...stroke} />
      <path d="M9 7.5V6a3 3 0 016 0v1.5" {...stroke} />
    </Icon>
  );
}

export function IconUser(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.5" {...stroke} />
      <path d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5" {...stroke} />
    </Icon>
  );
}

export function IconMetro(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="6" width="16" height="11" rx="2" {...stroke} />
      <path d="M4 11h16M8 17v2M16 17v2" {...stroke} />
      <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconShield(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5L19 6.5v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-6L12 3.5z" {...stroke} />
      <path d="M9 12l2 2 4-4.5" {...stroke} />
    </Icon>
  );
}

export function IconStar(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12 4l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 9.2l5-.7L12 4z"
        {...stroke}
      />
    </Icon>
  );
}

export function IconMountain(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 18l5-10 3 6 3-4 5 8H4z" {...stroke} />
      <path d="M14 10l2-3 4 8" {...stroke} />
    </Icon>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" {...stroke} />
      <path d="M4 10h16M8 3v4M16 3v4" {...stroke} />
    </Icon>
  );
}

export function IconGauge(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4a8 8 0 108 8" {...stroke} />
      <path d="M12 12V8" {...stroke} />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconFilter(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h16M7 12h10M10 18h4" {...stroke} />
    </Icon>
  );
}

export function IconX(props: IconProps) {
  return (
    <Icon {...props} size={props.size ?? 16}>
      <path d="M6 6l12 12M18 6L6 18" {...stroke} />
    </Icon>
  );
}

export function IconMapPin(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z" {...stroke} />
      <circle cx="12" cy="11" r="2" {...stroke} />
    </Icon>
  );
}

export function IconCompass(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" {...stroke} />
      <path d="M14.5 9.5L10 14l-2.5-2.5L12 10l2.5-2.5z" {...stroke} />
    </Icon>
  );
}

export function IconTent(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 18L12 5l8 13H4z" {...stroke} />
      <path d="M12 5v13" {...stroke} />
    </Icon>
  );
}

export function IconInspect(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" {...stroke} />
      <path d="M16 16l4.5 4.5" {...stroke} />
      <path d="M9 11l1.5 1.5L13 9" {...stroke} />
    </Icon>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <Icon {...props} size={props.size ?? 16}>
      <path d="M5 12h14M13 6l6 6-6 6" {...stroke} />
    </Icon>
  );
}

export function IconPackage(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" {...stroke} />
      <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" {...stroke} />
    </Icon>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Icon {...props} size={props.size ?? 16}>
      <path d="M5 12.5l3.5 3.5L19 7" {...stroke} />
    </Icon>
  );
}

export function IconCart(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 8h13l-1.5 9H8L6 8z" {...stroke} />
      <path d="M9 8V6a3 3 0 016 0v2" {...stroke} />
    </Icon>
  );
}

export function IconBackpack(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 8V7a4 4 0 018 0v1" {...stroke} />
      <path d="M6 8h12l-1 11H7L6 8z" {...stroke} />
      <path d="M10 12h4" {...stroke} />
    </Icon>
  );
}

export function IconBoot(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 14h8l2 4H4l2-4z" {...stroke} />
      <path d="M8 14V9a2 2 0 014 0v5" {...stroke} />
    </Icon>
  );
}

export function IconSleepingBag(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 18c2-8 4-10 7-10s5 2 7 10H5z" {...stroke} />
      <path d="M9 12h6" {...stroke} />
    </Icon>
  );
}

export function IconKitchen(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 10h12v8H6z" {...stroke} />
      <path d="M9 7v3M12 6v4M15 7v3" {...stroke} />
    </Icon>
  );
}

export function IconFlashlight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 4h4l1 4-3 12-3-12 1-4z" {...stroke} />
      <path d="M11 8h2" {...stroke} />
    </Icon>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Icon {...props} size={props.size ?? 16}>
      <path d="M12 5v14M5 12h14" {...stroke} />
    </Icon>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <Icon {...props} size={props.size ?? 16}>
      <path d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12" {...stroke} />
    </Icon>
  );
}

export function IconSave(props: IconProps) {
  return (
    <Icon {...props} size={props.size ?? 16}>
      <path d="M6 4h10l2 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" {...stroke} />
      <path d="M8 4v5h8V4M8 18h8" {...stroke} />
    </Icon>
  );
}

export function IconLayers(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4l8 4-8 4-8-4 8-4z" {...stroke} />
      <path d="M4 12l8 4 8-4M4 16l8 4 8-4" {...stroke} />
    </Icon>
  );
}
