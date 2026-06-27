import {Link} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';

export const meta = () => [{title: 'Campmania | Verification'}];

export default function VerifyDoneRoute() {
  const {translations: tr} = useLocale();

  return (
    <section className="tr-page-width py-16">
      <div className="mx-auto max-w-lg rounded-md border border-moss/30 bg-white p-8 text-center shadow-sm">
        <h1 className="font-display text-2xl font-bold text-pine">
          {tr.kyc.doneTitle}
        </h1>
        <p className="mt-3 text-sm text-muted">{tr.kyc.doneBody}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/cart" className="tr-btn-primary">
            {tr.kyc.backToCart}
          </Link>
          <Link to="/account" className="tr-btn-secondary">
            {tr.account.eyebrow}
          </Link>
        </div>
      </div>
    </section>
  );
}
