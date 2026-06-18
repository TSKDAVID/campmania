import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useLocale} from '~/providers/LocaleProvider';
import {
  canEditCartLineQuantity,
  getCartLineMeta,
  getVisibleSelectedOptions,
  hasLineComponents,
  isBundleCartLine,
  resolveCartLineDisplayPrice,
  resolveCartLineUnitPrice,
} from '~/lib/trailrent/cart-display';
import {formatGel} from '~/lib/trailrent/pricing';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

export function CartLineItem({
  layout,
  line,
  childrenMap,
  nested = false,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
  nested?: boolean;
}) {
  const {translations: tr, locale} = useLocale();
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;
  const visibleOptions = getVisibleSelectedOptions(selectedOptions);
  const meta = getCartLineMeta(line, locale, {
    modeRent: tr.cart.modeRent,
    modeBuy: tr.cart.modeBuy,
  });
  const displayTotal = resolveCartLineDisplayPrice(line);
  const unitPrice = resolveCartLineUnitPrice(line);
  const bundleComponents = hasLineComponents(line)
    ? (line.lineComponents ?? [])
    : [];
  const showBundleList = isBundleCartLine(line) && bundleComponents.length > 0;
  const quantityEditable = canEditCartLineQuantity(line);

  return (
    <li
      key={id}
      className={`cm-cart-line${nested ? ' cm-cart-line--nested' : ''}`}
    >
      <article className="cm-cart-line-card">
        <div className="cm-cart-line-media">
          {image ? (
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={88}
              loading="lazy"
              width={88}
              className="cm-cart-line-image"
            />
          ) : (
            <div className="cm-cart-line-image-fallback" aria-hidden />
          )}
        </div>

        <div className="cm-cart-line-body">
          <div className="cm-cart-line-header">
            <Link
              prefetch="intent"
              to={lineItemUrl}
              className="cm-cart-line-title"
              onClick={() => {
                if (layout === 'aside') close();
              }}
            >
              {product.title}
            </Link>
            <CartLineRemoveButton
              lineIds={[id]}
              disabled={!!line.isOptimistic}
              label={tr.cart.remove}
            />
          </div>

          {visibleOptions.length ? (
            <ul className="cm-cart-line-options">
              {visibleOptions.map((option) => (
                <li key={`${option.name}-${option.value}`}>
                  {option.name}: {option.value}
                </li>
              ))}
            </ul>
          ) : null}

          {(meta.modeLabel || meta.rentalPeriod || meta.metro) && (
            <dl className="cm-cart-line-meta">
              {meta.modeLabel ? (
                <div>
                  <dt className="sr-only">{tr.cart.modeRent}</dt>
                  <dd>
                    <span className="cm-cart-line-badge">{meta.modeLabel}</span>
                  </dd>
                </div>
              ) : null}
              {meta.rentalPeriod ? (
                <div>
                  <dt className="sr-only">{tr.booking.dates}</dt>
                  <dd>{meta.rentalPeriod}</dd>
                </div>
              ) : null}
              {meta.metro ? (
                <div>
                  <dt className="sr-only">{tr.booking.metro}</dt>
                  <dd>{meta.metro}</dd>
                </div>
              ) : null}
            </dl>
          )}

          {showBundleList ? (
            <div className="cm-cart-line-bundle">
              <p className="cm-cart-line-bundle-label">{tr.cart.bundleIncludes}</p>
              <ul>
                {bundleComponents.map((component) => (
                  <li key={component.id}>
                    {component.merchandise.product.title}
                    {component.quantity > 1 ? ` × ${component.quantity}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="cm-cart-line-footer">
            <div className="cm-cart-line-price" aria-label="Price">
              {displayTotal > 0 ? (
                <>
                  <span className="cm-cart-line-price-total">
                    {formatGel(displayTotal)}
                  </span>
                  {meta.rentalDays && unitPrice > 0 ? (
                    <span className="cm-cart-line-price-detail">
                      {formatGel(unitPrice)} {tr.cart.perDay} · {meta.rentalDays}{' '}
                      {tr.cart.days}
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="cm-cart-line-price-pending">
                  {tr.cart.priceAtCheckout}
                </span>
              )}
            </div>

            <CartLineQuantity
              line={line}
              editable={quantityEditable}
              rentalDays={meta.rentalDays}
              labels={tr.cart}
            />
          </div>
        </div>
      </article>

      {lineItemChildren ? (
        <div className="cm-cart-line-children-wrap">
          <p id={childrenLabelId} className="sr-only">
            Line items with {product.title}
          </p>
          <ul
            aria-labelledby={childrenLabelId}
            className="cm-cart-line-children"
          >
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
                nested
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function CartLineQuantity({
  line,
  editable,
  rentalDays,
  labels,
}: {
  line: CartLine;
  editable: boolean;
  rentalDays?: number;
  labels: {
    quantity: string;
    days: string;
    decreaseQuantity: string;
    increaseQuantity: string;
  };
}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;

  if (!editable) {
    const displayQty = rentalDays && rentalDays > 0 ? rentalDays : quantity;
    if (displayQty <= 0) return null;

    return (
      <div className="cm-cart-line-qty cm-cart-line-qty--readonly">
        <span className="cm-cart-line-qty-label">
          {rentalDays ? labels.days : labels.quantity}
        </span>
        <span className="cm-cart-line-qty-value">{displayQty}</span>
      </div>
    );
  }

  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="cm-cart-line-qty">
      <span className="cm-cart-line-qty-label">{labels.quantity}</span>
      <div className="cm-cart-line-qty-controls">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            type="button"
            className="cm-cart-line-qty-btn"
            aria-label={labels.decreaseQuantity}
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
          >
            −
          </button>
        </CartLineUpdateButton>
        <span className="cm-cart-line-qty-value" aria-live="polite">
          {quantity}
        </span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            type="button"
            className="cm-cart-line-qty-btn"
            aria-label={labels.increaseQuantity}
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
          >
            +
          </button>
        </CartLineUpdateButton>
      </div>
    </div>
  );
}

function CartLineRemoveButton({
  lineIds,
  disabled,
  label,
}: {
  lineIds: string[];
  disabled: boolean;
  label: string;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        type="submit"
        className="cm-cart-line-remove"
        disabled={disabled}
        aria-label={label}
      >
        {label}
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
