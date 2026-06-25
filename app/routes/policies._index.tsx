import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';
import {useLocale} from '~/providers/LocaleProvider';

export async function loader({context}: Route.LoaderArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();
  const {locale} = useLocale();

  return (
    <section className="cm-doc-page">
      <h1 className="cm-doc-title">
        {locale === 'ka' ? 'პოლიტიკები' : 'Policies'}
      </h1>
      <p className="cm-doc-lead">
        {locale === 'ka'
          ? 'შეისწავლე წესები, მიწოდება და დაბრუნების პირობები.'
          : 'Review terms, shipping, and return policies.'}
      </p>
      <div className="cm-doc-grid">
        {policies.map((policy) => (
          <article key={policy.id} className="cm-doc-card">
            <Link to={`/policies/${policy.handle}`}>{policy.title}</Link>
          </article>
        ))}
      </div>
    </section>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
