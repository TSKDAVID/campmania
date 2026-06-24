import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';
import {formatCartMoney, moneyAmount, resolveCartDisplaySubtotal} from '~/lib/trailrent/cart-display';
import {formatGel} from '~/lib/trailrent/pricing';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
  deliveryFee?: number;
};

export function CartSummary({cart, layout, deliveryFee = 0}: CartSummaryProps) {
  const {translations: tr} = useLocale();
  const className =
    layout === 'page' ? 'cart-summary-page cm-cart-summary' : 'cart-summary-aside cm-cart-summary';
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();
  const subtotalAmount = moneyAmount(cart?.cost?.subtotalAmount);
  const lines = cart?.lines?.nodes ?? [];
  const displaySubtotal =
    lines.length > 0
      ? resolveCartDisplaySubtotal(lines)
      : subtotalAmount;
  const displayTotal = displaySubtotal + deliveryFee;
  const isAside = layout === 'aside';

  return (
    <div aria-labelledby={summaryId} className={className}>
      {!isAside ? (
        <h4 id={summaryId} className="cm-cart-summary-heading">
          {tr.cart.totals}
        </h4>
      ) : (
        <h4 id={summaryId} className="sr-only">
          {tr.cart.totals}
        </h4>
      )}

      {isAside && deliveryFee > 0 ? (
        <dl className="cm-cart-fee-row">
          <dt>{tr.pages.delivery}</dt>
          <dd>{formatGel(deliveryFee)}</dd>
        </dl>
      ) : null}

      <dl className={`cm-cart-subtotal${isAside ? ' cm-cart-subtotal--aside' : ''}`}>
        <dt>{isAside ? tr.booking.total : tr.cart.subtotal}</dt>
        <dd>{displayTotal > 0 ? formatGel(displayTotal) : '—'}</dd>
      </dl>

      {layout === 'page' ? (
        <>
          <CartDiscounts
            discountCodes={cart?.discountCodes}
            discountsHeadingId={discountsHeadingId}
            discountCodeInputId={discountCodeInputId}
            labels={tr.cart}
          />
          <CartGiftCard
            giftCardCodes={cart?.appliedGiftCards}
            giftCardHeadingId={giftCardHeadingId}
            giftCardInputId={giftCardInputId}
            labels={tr.cart}
          />
        </>
      ) : null}

      <CartCheckoutActions
        checkoutUrl={cart?.checkoutUrl}
        label={tr.cart.checkout}
      />

      {layout === 'aside' ? (
        <p className="cm-cart-aside-note">{tr.cart.deliveryNote}</p>
      ) : null}
    </div>
  );
}

function CartCheckoutActions({
  checkoutUrl,
  label,
}: {
  checkoutUrl?: string;
  label: string;
}) {
  if (!checkoutUrl) return null;

  return (
    <a href={checkoutUrl} target="_self" className="tr-btn-primary cm-cart-checkout">
      {label}
    </a>
  );
}

type CartLabels = ReturnType<
  typeof import('~/providers/LocaleProvider').useLocale
>['translations']['cart'];

function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
  labels,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  discountsHeadingId: string;
  discountCodeInputId: string;
  labels: CartLabels;
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section aria-label={labels.discounts} className="cm-cart-discounts">
      <dl hidden={!codes.length}>
        <div>
          <dt id={discountsHeadingId}>{labels.discounts}</dt>
          <UpdateDiscountForm>
            <div
              className="cart-discount"
              role="group"
              aria-labelledby={discountsHeadingId}
            >
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button type="submit" aria-label={labels.remove}>
                {labels.remove}
              </button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      <UpdateDiscountForm discountCodes={codes}>
        <div className="cm-cart-discount-form">
          <label htmlFor={discountCodeInputId} className="sr-only">
            {labels.discountCode}
          </label>
          <input
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder={labels.discountCode}
          />
          <button type="submit" aria-label={labels.apply}>
            {labels.apply}
          </button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
  giftCardHeadingId,
  giftCardInputId,
  labels,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
  giftCardHeadingId: string;
  giftCardInputId: string;
  labels: CartLabels;
}) {
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const removeButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousCardIdsRef = useRef<string[]>([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      if (giftCardCodeInput.current !== null) {
        giftCardCodeInput.current.value = '';
      }
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];

    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;

      if (focusButton) {
        focusButton.focus();
      } else if (giftCardCodeInput.current) {
        giftCardCodeInput.current.focus();
      }

      setRemovedCardIndex(null);
    }

    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const handleRemoveClick = (cardId: string) => {
    const index = previousCardIdsRef.current.indexOf(cardId);
    if (index !== -1) {
      setRemovedCardIndex(index);
    }
  };

  return (
    <section aria-label={labels.giftCards} className="cm-cart-gift-cards">
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl>
          <dt id={giftCardHeadingId}>{labels.giftCards}</dt>
          {giftCardCodes.map((giftCard) => (
            <dd key={giftCard.id} className="cart-discount">
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
                removeLabel={labels.remove}
                onRemoveClick={() => handleRemoveClick(giftCard.id)}
                buttonRef={(el: HTMLButtonElement | null) => {
                  if (el) {
                    removeButtonRefs.current.set(giftCard.id, el);
                  } else {
                    removeButtonRefs.current.delete(giftCard.id);
                  }
                }}
              >
                <code>***{giftCard.lastCharacters}</code>
                &nbsp;
                {formatCartMoney(giftCard.amountUsed)}
              </RemoveGiftCardForm>
            </dd>
          ))}
        </dl>
      )}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <div className="cm-cart-discount-form">
          <label htmlFor={giftCardInputId} className="sr-only">
            {labels.giftCardCode}
          </label>
          <input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder={labels.giftCardCode}
            ref={giftCardCodeInput}
          />
          <button
            type="submit"
            disabled={giftCardAddFetcher.state !== 'idle'}
            aria-label={labels.apply}
          >
            {labels.apply}
          </button>
        </div>
      </AddGiftCardForm>
    </section>
  );
}

function AddGiftCardForm({
  fetcherKey,
  children,
}: {
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  removeLabel,
  children,
  onRemoveClick,
  buttonRef,
}: {
  giftCardId: string;
  lastCharacters: string;
  removeLabel: string;
  children: React.ReactNode;
  onRemoveClick?: () => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
      &nbsp;
      <button
        type="submit"
        aria-label={`Remove gift card ending in ${lastCharacters}`}
        onClick={onRemoveClick}
        ref={buttonRef}
      >
        {removeLabel}
      </button>
    </CartForm>
  );
}
