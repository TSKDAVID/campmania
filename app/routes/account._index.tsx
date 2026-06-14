import {useOutletContext} from 'react-router';
import type {Route} from './+types/account._index';
import {LoyaltyCard} from '~/components/trailrent/LoyaltyCard';
import {useLocale} from '~/providers/LocaleProvider';

type AccountContext = {
  customer: {
    firstName?: string | null;
    lastName?: string | null;
    emailAddress?: {emailAddress?: string | null} | null;
  };
};

export const meta: Route.MetaFunction = () => [
  {title: 'TrailRent | Account'},
];

export default function AccountDashboard() {
  const {customer} = useOutletContext<AccountContext>();
  const {translations: tr, locale} = useLocale();
  const email = customer.emailAddress?.emailAddress ?? null;

  return (
    <div className="space-y-8">
      <LoyaltyCard email={email} tags={[]} />

      <div className="tr-card p-6">
        <h2 className="font-display text-xl font-bold">
          {locale === 'ka' ? 'სწრაფი ბმულები' : 'Quick links'}
        </h2>
        <ul className="mt-4 space-y-2 text-moss">
          <li>
            <a href="/account/orders" className="hover:underline">
              {locale === 'ka' ? 'შეკვეთები' : 'Orders'}
            </a>
          </li>
          <li>
            <a href="/packages" className="hover:underline">
              {tr.nav.packages}
            </a>
          </li>
          <li>
            <a href="/individual-gear" className="hover:underline">
              {tr.nav.gear}
            </a>
          </li>
        </ul>
      </div>

      <p className="text-sm text-muted">
        {locale === 'ka'
          ? 'დემო: explorer@demo.trailrent.ge ან trail-tested@demo.trailrent.ge'
          : 'Demo: use explorer@demo.trailrent.ge or trail-tested@demo.trailrent.ge emails'}
      </p>
    </div>
  );
}
