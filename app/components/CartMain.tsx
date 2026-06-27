import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useState} from 'react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {
  DeliverySelector,
  HOME_DELIVERY_FEE,
  TBILISI_METRO_STATIONS,
  type DeliveryOption,
} from '~/components/trailrent/DeliverySelector';
import {useLocale} from '~/providers/LocaleProvider';
import {shouldShowCartLine} from '~/lib/trailrent/cart-display';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
  hasRentalLines?: boolean;
  isLoggedIn?: boolean;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}

export function CartMain({
  layout,
  cart: originalCart,
  hasRentalLines = false,
  isLoggedIn = false,
}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);
  const {translations: tr} = useLocale();
  const [deliveryOption, setDeliveryOption] =
    useState<DeliveryOption>('metro');
  const [metroStationId, setMetroStationId] = useState(
    TBILISI_METRO_STATIONS[0]?.id ?? '',
  );
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const deliveryFee = deliveryOption === 'home' ? HOME_DELIVERY_FEE : 0;

  const visibleLines = (cart?.lines?.nodes ?? []).filter(shouldShowCartLine);
  const linesCount = visibleLines.length > 0;
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);
  const isAside = layout === 'aside';

  return (
    <section
      className={`cart-main${isAside ? ' cart-main--aside' : ''}${
        withDiscount ? ' with-discount' : ''
      }`}
      aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
    >
      <CartEmpty hidden={linesCount} layout={layout} />

      {linesCount ? (
        <div className={`cart-details${isAside ? ' cart-details--aside' : ''}`}>
          {isAside ? (
            <div className="cm-cart-aside">
              <div className="cm-cart-aside-scroll">
                <section className="cm-cart-aside-panel" aria-labelledby="cart-lines">
                  <p id="cart-lines" className="cm-cart-aside-section-label">
                    {tr.cart.itemsSection}
                  </p>
                  <ul className="cm-cart-lines cm-cart-lines--aside">
                    {visibleLines.map((line) => (
                      <CartLineItem
                        key={line.id}
                        line={line}
                        layout={layout}
                        childrenMap={childrenMap}
                      />
                    ))}
                  </ul>
                </section>

                <section className="cm-cart-aside-delivery">
                  <DeliverySelector
                    option={deliveryOption}
                    onOptionChange={setDeliveryOption}
                    metroStationId={metroStationId}
                    onMetroStationChange={setMetroStationId}
                    address={deliveryAddress}
                    onAddressChange={setDeliveryAddress}
                  />
                </section>
              </div>

              {cartHasItems ? (
                <div className="cm-cart-aside-footer">
                  <CartSummary
                    cart={cart}
                    layout={layout}
                    deliveryFee={deliveryFee}
                    hasRentalLines={hasRentalLines}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <div>
                <p id="cart-lines" className="sr-only">
                  Line items
                </p>
                <ul
                  aria-labelledby="cart-lines"
                  className="cm-cart-lines"
                >
                  {visibleLines.map((line) => (
                    <CartLineItem
                      key={line.id}
                      line={line}
                      layout={layout}
                      childrenMap={childrenMap}
                    />
                  ))}
                </ul>
              </div>

              {cartHasItems ? (
                <CartSummary
                  cart={cart}
                  layout={layout}
                  deliveryFee={0}
                  hasRentalLines={hasRentalLines}
                  isLoggedIn={isLoggedIn}
                />
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}

function CartEmpty({
  hidden = false,
  layout,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  const {translations: tr} = useLocale();
  const isAside = layout === 'aside';

  return (
    <div hidden={hidden} className={isAside ? 'cm-cart-empty' : undefined}>
      {!isAside ? <br /> : null}
      <p>{tr.cart.empty}</p>
      {!isAside ? <br /> : null}
      <Link
        to="/packages"
        onClick={close}
        prefetch="viewport"
        className={isAside ? 'cm-cart-empty-link' : undefined}
      >
        {tr.cart.continueShopping}
      </Link>
    </div>
  );
}
