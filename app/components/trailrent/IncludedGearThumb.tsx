import {Link} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {formatGel} from '~/lib/trailrent/pricing';

export type IncludedGearThumbItem = {
  title: string;
  handle?: string;
  imageUrl?: string;
  dailyRate?: number;
};

type IncludedGearThumbProps = {
  item: IncludedGearThumbItem;
  /** Thumb surface styles (catalog vs PDP sizing). */
  thumbClassName: string;
  /** When set, thumb navigates to the gear product page. */
  href?: string;
  /** Prevent parent stretched links from receiving the click (package cards). */
  stopLinkPropagation?: boolean;
  listItem?: boolean;
};

export function IncludedGearThumb({
  item,
  thumbClassName,
  href,
  stopLinkPropagation,
  listItem,
}: IncludedGearThumbProps) {
  const {locale} = useLocale();
  const perDay = locale === 'ka' ? 'დღე' : 'day';

  const thumbContent = item.imageUrl ? (
    <img src={item.imageUrl} alt="" loading="lazy" />
  ) : (
    <span>{item.title.slice(0, 2).toUpperCase()}</span>
  );

  const thumb =
    href != null ? (
      <Link
        to={href}
        className={thumbClassName}
        aria-label={item.title}
        prefetch="intent"
        onClick={
          stopLinkPropagation
            ? (event) => {
                event.stopPropagation();
              }
            : undefined
        }
      >
        {thumbContent}
      </Link>
    ) : (
      <span className={thumbClassName} tabIndex={0}>
        {thumbContent}
      </span>
    );

  const wrap = (
    <div className="cm-product-included-thumb-wrap">
      {thumb}
      <span className="cm-product-included-tooltip" role="tooltip">
        <span className="cm-product-included-tooltip-title">{item.title}</span>
        {item.dailyRate != null && item.dailyRate > 0 ? (
          <span className="cm-product-included-tooltip-price">
            {formatGel(item.dailyRate)} / {perDay}
          </span>
        ) : null}
      </span>
    </div>
  );

  if (listItem) {
    return (
      <div role="listitem">
        {wrap}
      </div>
    );
  }

  return wrap;
}
