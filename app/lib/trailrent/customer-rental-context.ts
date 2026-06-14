import type {CustomerRentalHistoryQuery} from 'customer-accountapi.generated';
import {CUSTOMER_RENTAL_HISTORY_QUERY} from '~/graphql/customer-account/CustomerRentalHistoryQuery';
import {parseCustomerTags} from '~/lib/trailrent/loyalty';

type RentalHistoryOrder =
  CustomerRentalHistoryQuery['customer']['orders']['nodes'][number];

export type CustomerRentalContext = {
  tags: string[];
  orders: RentalHistoryOrder[];
};

export const EMPTY_CUSTOMER_RENTAL_CONTEXT: CustomerRentalContext = {
  tags: [],
  orders: [],
};

type CustomerContext = {
  customerAccount: {
    isLoggedIn: () => Promise<boolean>;
    query: (
      query: string,
      options?: {variables?: Record<string, unknown>},
    ) => Promise<{
      data?: CustomerRentalHistoryQuery | null;
      errors?: unknown[];
    }>;
    i18n: {language: string};
  };
};

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/** Customer tags + order history for rent-to-own and Trusted Tier. Never blocks long. */
export async function loadCustomerRentalContext(
  context: CustomerContext,
): Promise<CustomerRentalContext> {
  const {customerAccount} = context;

  return withTimeout(
    customerAccount
      .isLoggedIn()
      .then(async (loggedIn) => {
        if (!loggedIn) return EMPTY_CUSTOMER_RENTAL_CONTEXT;

        const {data, errors} = await customerAccount.query(
          CUSTOMER_RENTAL_HISTORY_QUERY,
          {
            variables: {
              language: customerAccount.i18n.language,
              first: 25,
            },
          },
        );

        if (errors?.length || !data?.customer) {
          return EMPTY_CUSTOMER_RENTAL_CONTEXT;
        }

        return {
          tags: parseCustomerTags(data.customer.tags),
          orders: data.customer.orders.nodes,
        };
      })
      .catch(() => EMPTY_CUSTOMER_RENTAL_CONTEXT),
    2500,
    EMPTY_CUSTOMER_RENTAL_CONTEXT,
  );
}
