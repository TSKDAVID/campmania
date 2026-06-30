import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';
import {cartHasRentalLines} from '~/lib/trailrent/deposit';
import {
  getKycCheckoutStatus,
  isKycVerified,
  isRentalBlocked,
} from '~/lib/trailrent/kyc';
import {parseCustomerTags} from '~/lib/trailrent/loyalty';
import type {CartLine} from '~/components/CartLineItem';

const CUSTOMER_TAGS_QUERY = `#graphql
  query CartKycCustomer {
    customer {
      tags
    }
  }
` as const;

export const meta: Route.MetaFunction = () => {
  return [{title: `Campmania | Cart`}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    case CartForm.ACTIONS.AttributesUpdateInput: {
      result = await cart.updateAttributes(inputs.attributes);
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const {cart, customerAccount} = context;
  const cartData = await cart.get();
  const lines = (cartData?.lines?.nodes ?? []) as CartLine[];
  const isLoggedIn = await customerAccount.isLoggedIn();

  let kycStatus = getKycCheckoutStatus([]);
  let kycVerified = false;
  let kycBlocked = false;

  if (isLoggedIn) {
    const {data} = await customerAccount.query(CUSTOMER_TAGS_QUERY);
    const tags = parseCustomerTags(data?.customer?.tags);
    kycStatus = getKycCheckoutStatus(tags);
    kycVerified = isKycVerified(tags);
    kycBlocked = isRentalBlocked(tags);
  }

  return {
    cart: cartData,
    hasRentalLines: cartHasRentalLines(lines),
    isLoggedIn,
    kycStatus,
    kycVerified,
    kycBlocked,
  };
}

export default function Cart() {
  const {
    cart,
    hasRentalLines,
    isLoggedIn,
    kycStatus,
    kycVerified,
    kycBlocked,
  } = useLoaderData<typeof loader>();

  return (
    <section className="cm-cart-page tr-page-width">
      <header className="cm-cart-page__head">
        <p className="cm-page-kicker">Cart Ledger</p>
        <h1 className="cm-page-title">Cart</h1>
      </header>
      <CartMain
        layout="page"
        cart={cart}
        hasRentalLines={hasRentalLines}
        isLoggedIn={isLoggedIn}
        kycStatus={kycStatus}
        kycVerified={kycVerified}
        kycBlocked={kycBlocked}
      />
    </section>
  );
}
