import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import type {Route} from './+types/account.profile';
import {useLocale} from '~/providers/LocaleProvider';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = () => [
  {title: 'Campmania | Profile'},
];

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as (typeof validInputKeys)[number])) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    const {data: mutationData, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!mutationData?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: mutationData.customerUpdate.customer,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Update failed.';
    return data({error: message, customer: null}, {status: 400});
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {translations: tr} = useLocale();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;
  const isSaving = state !== 'idle';
  const justSaved = action?.customer && !action.error;

  return (
    <div className="max-w-xl">
      <div className="cm-account-panel">
        <h2 className="font-display text-xl font-bold text-pine">
          {tr.account.profileTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{tr.account.profileSubtitle}</p>

        <Form method="PUT" className="mt-6 space-y-5">
          <div>
            <label htmlFor="firstName" className="cm-form-label">
              {tr.account.firstName}
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              className="cm-form-field"
              defaultValue={customer.firstName ?? ''}
              minLength={2}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="cm-form-label">
              {tr.account.lastName}
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              className="cm-form-field"
              defaultValue={customer.lastName ?? ''}
              minLength={2}
              required
            />
          </div>

          {action?.error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {action.error}
            </p>
          ) : null}

          {justSaved ? (
            <p className="rounded-lg border border-moss/30 bg-moss/10 px-3 py-2 text-sm font-medium text-forest">
              {tr.account.saved}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="tr-btn-primary disabled:opacity-60"
          >
            {isSaving ? tr.account.saving : tr.account.save}
          </button>
        </Form>
      </div>
    </div>
  );
}
