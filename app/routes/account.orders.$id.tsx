import {Link, redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {useLocale} from '~/providers/LocaleProvider';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();
  const {locale} = useLocale();

  const placedOn = new Intl.DateTimeFormat(locale === 'ka' ? 'ka-GE' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(order.processedAt!));

  return (
    <section className="cm-order-detail">
      <Link to="/account/orders" className="cm-doc-back">
        {locale === 'ka' ? '← შეკვეთებში დაბრუნება' : '← Back to orders'}
      </Link>
      <h2 style={{margin: '0.5rem 0 0'}}>
        {locale === 'ka' ? 'შეკვეთა' : 'Order'} {order.name}
      </h2>
      <p className="cm-doc-meta">
        {locale === 'ka' ? 'შეკვეთის თარიღი:' : 'Placed on:'} {placedOn}
        {order.confirmationNumber
          ? ` · ${locale === 'ka' ? 'დადასტურება' : 'Confirmation'}: ${order.confirmationNumber}`
          : ''}
      </p>
      <div className="cm-order-detail-grid">
        <div style={{overflowX: 'auto'}}>
          <table className="cm-order-detail-table">
          <thead>
            <tr>
              <th scope="col">{locale === 'ka' ? 'პროდუქტი' : 'Product'}</th>
              <th scope="col">{locale === 'ka' ? 'ფასი' : 'Price'}</th>
              <th scope="col">{locale === 'ka' ? 'რაოდ.' : 'Qty'}</th>
              <th scope="col">{locale === 'ka' ? 'ჯამი' : 'Total'}</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((lineItem, lineItemIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
            ))}
          </tbody>
          <tfoot>
            {((discountValue && discountValue.amount) ||
              discountPercentage) && (
              <tr>
                <th scope="row" colSpan={3}>
                  <p>{locale === 'ka' ? 'ფასდაკლება' : 'Discounts'}</p>
                </th>
                <td>
                  {discountPercentage ? (
                    <span>-{discountPercentage}% OFF</span>
                  ) : (
                    discountValue && <Money data={discountValue!} />
                  )}
                </td>
              </tr>
            )}
            <tr>
              <th scope="row" colSpan={3}>
                <p>{locale === 'ka' ? 'შუალედური ჯამი' : 'Subtotal'}</p>
              </th>
              <td>
                <Money data={order.subtotal!} />
              </td>
            </tr>
            <tr>
              <th scope="row" colSpan={3}>
                <p>{locale === 'ka' ? 'გადასახადი' : 'Tax'}</p>
              </th>
              <td>
                <Money data={order.totalTax!} />
              </td>
            </tr>
            <tr>
              <th scope="row" colSpan={3}>
                <p>{locale === 'ka' ? 'ჯამი' : 'Total'}</p>
              </th>
              <td>
                <Money data={order.totalPrice!} />
              </td>
            </tr>
          </tfoot>
          </table>
        </div>
        <aside className="cm-order-side-card">
          <h3 style={{margin: 0}}>
            {locale === 'ka' ? 'მიწოდების მისამართი' : 'Shipping address'}
          </h3>
          {order?.shippingAddress ? (
            <address style={{fontStyle: 'normal'}}>
              <p>{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted ? (
                <p>{order.shippingAddress.formatted}</p>
              ) : null}
              {order.shippingAddress.formattedArea ? (
                <p>{order.shippingAddress.formattedArea}</p>
              ) : null}
            </address>
          ) : (
            <p className="cm-doc-meta">
              {locale === 'ka'
                ? 'მიწოდების მისამართი არ არის მითითებული'
                : 'No shipping address defined'}
            </p>
          )}
          <h3 style={{margin: 0}}>
            {locale === 'ka' ? 'სტატუსი' : 'Status'}
          </h3>
          <p className="cm-order-status cm-order-status--neutral">{fulfillmentStatus}</p>
          <a target="_blank" href={order.statusPageUrl} rel="noreferrer" className="cm-doc-back">
            {locale === 'ka' ? 'სტატუსის გვერდი →' : 'Order status page →'}
          </a>
        </aside>
      </div>
    </section>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <tr key={lineItem.id}>
      <td>
        <div className="cm-order-detail-line">
          {lineItem?.image && (
            <div>
              <Image data={lineItem.image} width={96} height={96} />
            </div>
          )}
          <div>
            <p>{lineItem.title}</p>
            <small>{lineItem.variantTitle}</small>
          </div>
        </div>
      </td>
      <td>
        <Money data={lineItem.price!} />
      </td>
      <td>{lineItem.quantity}</td>
      <td>
        <Money data={lineItem.totalDiscount!} />
      </td>
    </tr>
  );
}
