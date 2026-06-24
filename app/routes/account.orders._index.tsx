import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {useRef} from 'react';
import {
  Money,
  Pagination,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {useLocale} from '~/providers/LocaleProvider';
import {
  IconArrowRight,
  IconBag,
  IconCalendar,
  IconPackage,
  IconSearch,
} from '~/components/trailrent/Icons';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => [{title: 'Campmania | Orders'}];

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

function formatOrderDate(value: string, locale: 'ka' | 'en') {
  return new Intl.DateTimeFormat(locale === 'ka' ? 'ka-GE' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function orderStatusLabel(
  status: string | null | undefined,
  kind: 'financial' | 'fulfillment',
  labels: (typeof import('~/lib/trailrent/i18n').translations)['ka']['ordersPage'],
): string {
  const key = status?.toUpperCase() ?? '';

  if (kind === 'financial') {
    if (key === 'PAID') return labels.statusPaid;
    if (key === 'PENDING' || key === 'AUTHORIZED') return labels.statusPending;
    if (key === 'REFUNDED' || key === 'PARTIALLY_REFUNDED') {
      return labels.statusRefunded;
    }
    return status ?? '—';
  }

  if (key === 'FULFILLED') return labels.statusFulfilled;
  if (key === 'PARTIALLY_FULFILLED') return labels.statusPartial;
  if (key === 'UNFULFILLED' || key === 'IN_PROGRESS') {
    return labels.statusUnfulfilled;
  }
  return status ?? '—';
}

function statusTone(status: string | null | undefined) {
  const key = status?.toUpperCase() ?? '';
  if (key === 'PAID' || key === 'FULFILLED') return 'cm-order-status--success';
  if (key === 'PARTIALLY_FULFILLED' || key === 'IN_PROGRESS') {
    return 'cm-order-status--pending';
  }
  if (key === 'REFUNDED' || key === 'PARTIALLY_REFUNDED') {
    return 'cm-order-status--muted';
  }
  return 'cm-order-status--neutral';
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;
  const {translations: tr} = useLocale();

  return (
    <div className="cm-orders-page">
      <header className="cm-orders-page-header">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-moss">
            {tr.account.orders}
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-pine md:text-3xl">
            {tr.ordersPage.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {tr.ordersPage.subtitle}
          </p>
        </div>
      </header>

      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

function OrdersTable({
  orders,
  filters,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
}) {
  const {translations: tr} = useLocale();
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div className="cm-orders-results" aria-live="polite">
      {orders?.nodes.length ? (
        <Pagination connection={orders}>
          {({nodes, isLoading, PreviousLink, NextLink}) => (
            <>
              <div className="cm-orders-pagination">
                <PreviousLink className="cm-orders-pagination-link">
                  {isLoading ? tr.ordersPage.loading : tr.ordersPage.loadPrevious}
                </PreviousLink>
                <NextLink className="cm-orders-pagination-link">
                  {isLoading ? tr.ordersPage.loading : tr.ordersPage.loadMore}
                </NextLink>
              </div>

              <ul className="cm-orders-list">
                {nodes.map((order) => (
                  <OrderItem key={order.id} order={order} />
                ))}
              </ul>

              <div className="cm-orders-pagination cm-orders-pagination--bottom">
                <PreviousLink className="cm-orders-pagination-link">
                  {isLoading ? tr.ordersPage.loading : tr.ordersPage.loadPrevious}
                </PreviousLink>
                <NextLink className="cm-orders-pagination-link">
                  {isLoading ? tr.ordersPage.loading : tr.ordersPage.loadMore}
                </NextLink>
              </div>
            </>
          )}
        </Pagination>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  const {translations: tr} = useLocale();

  return (
    <div className="cm-orders-empty">
      <span className="cm-orders-empty-icon" aria-hidden>
        <IconBag size={28} />
      </span>
      <h3 className="mt-4 font-display text-xl font-bold text-pine">
        {hasFilters ? tr.ordersPage.noOrdersFiltered : tr.ordersPage.noOrders}
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted">
        {hasFilters
          ? tr.ordersPage.noOrdersFilteredDesc
          : tr.ordersPage.noOrdersDesc}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasFilters ? (
          <Link to="/account/orders" className="tr-btn-secondary">
            {tr.ordersPage.clear}
            <IconArrowRight size={14} />
          </Link>
        ) : (
          <>
            <Link to="/packages" className="tr-btn-primary">
              <IconPackage size={16} />
              {tr.ordersPage.bookKit}
            </Link>
            <Link to="/individual-gear" className="tr-btn-secondary">
              {tr.ordersPage.browseGear}
              <IconArrowRight size={14} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const {translations: tr} = useLocale();
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber) {
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);
    }

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="cm-orders-search"
      aria-label={tr.ordersPage.filterTitle}
    >
      <div className="cm-orders-search-head">
        <span className="cm-orders-search-icon" aria-hidden>
          <IconSearch size={18} />
        </span>
        <h3 className="font-display text-lg font-bold text-pine">
          {tr.ordersPage.filterTitle}
        </h3>
      </div>

      <div className="cm-orders-search-fields">
        <label className="cm-orders-search-field">
          <span className="cm-form-label">{tr.ordersPage.orderNumber}</span>
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder={tr.ordersPage.orderNumber}
            aria-label={tr.ordersPage.orderNumber}
            defaultValue={currentFilters.name || ''}
            className="cm-form-field"
          />
        </label>
        <label className="cm-orders-search-field">
          <span className="cm-form-label">{tr.ordersPage.confirmationNumber}</span>
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder={tr.ordersPage.confirmationNumber}
            aria-label={tr.ordersPage.confirmationNumber}
            defaultValue={currentFilters.confirmationNumber || ''}
            className="cm-form-field"
          />
        </label>
      </div>

      <div className="cm-orders-search-actions">
        <button
          type="submit"
          className="tr-btn-primary"
          disabled={isSearching}
        >
          {isSearching ? tr.ordersPage.searching : tr.ordersPage.search}
        </button>
        {hasFilters ? (
          <button
            type="button"
            className="tr-btn-secondary"
            disabled={isSearching}
            onClick={() => {
              setSearchParams(new URLSearchParams());
              formRef.current?.reset();
            }}
          >
            {tr.ordersPage.clear}
          </button>
        ) : null}
      </div>
    </form>
  );
}

function OrderItem({order}: {order: OrderItemFragment}) {
  const {translations: tr, locale} = useLocale();
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const orderHref = `/account/orders/${btoa(order.id)}`;

  return (
    <li className="cm-order-card">
      <div className="cm-order-card-main">
        <div className="cm-order-card-head">
          <Link to={orderHref} className="cm-order-card-number">
            #{order.number}
          </Link>
          <div className="cm-order-card-badges">
            <span
              className={`cm-order-status ${statusTone(order.financialStatus)}`}
            >
              {orderStatusLabel(order.financialStatus, 'financial', tr.ordersPage)}
            </span>
            {(fulfillmentStatus || order.fulfillmentStatus) && (
              <span
                className={`cm-order-status ${statusTone(
                  fulfillmentStatus ?? order.fulfillmentStatus,
                )}`}
              >
                {orderStatusLabel(
                  fulfillmentStatus ?? order.fulfillmentStatus,
                  'fulfillment',
                  tr.ordersPage,
                )}
              </span>
            )}
          </div>
        </div>

        <dl className="cm-order-card-meta">
          <div>
            <dt>{tr.ordersPage.placedOn}</dt>
            <dd className="inline-flex items-center gap-1.5">
              <IconCalendar size={14} className="text-moss" aria-hidden />
              {formatOrderDate(order.processedAt, locale)}
            </dd>
          </div>
          {order.confirmationNumber ? (
            <div>
              <dt>{tr.ordersPage.confirmation}</dt>
              <dd>{order.confirmationNumber}</dd>
            </div>
          ) : null}
          <div>
            <dt>{tr.ordersPage.total}</dt>
            <dd className="font-semibold text-pine">
              <Money data={order.totalPrice} />
            </dd>
          </div>
        </dl>
      </div>

      <Link to={orderHref} className="tr-btn-secondary cm-order-card-link">
        {tr.ordersPage.viewOrder}
        <IconArrowRight size={14} />
      </Link>
    </li>
  );
}
