import type {Route} from './+types/$';
import {Link} from 'react-router';
import {useLocale} from '~/providers/LocaleProvider';

export async function loader({request}: Route.LoaderArgs) {
  throw new Response(`${new URL(request.url).pathname} not found`, {
    status: 404,
  });
}

export default function CatchAllPage() {
  const {locale} = useLocale();

  return (
    <section className="cm-not-found">
      <div className="cm-not-found__card">
        <p className="cm-not-found__eyebrow">404</p>
        <h1>{locale === 'ka' ? 'გვერდი ვერ მოიძებნა' : 'Page not found'}</h1>
        <p>
          {locale === 'ka'
            ? 'ბილიკი აქ წყდება. დაბრუნდი მთავარ გვერდზე ან კატალოგში.'
            : 'The trail ends here. Return to home or continue to the catalog.'}
        </p>
        <div className="flex justify-center gap-2">
          <Link to="/" className="tr-btn-secondary">
            {locale === 'ka' ? 'მთავარი' : 'Home'}
          </Link>
          <Link to="/packages" className="tr-btn-primary">
            {locale === 'ka' ? 'ნაკრებები' : 'Packages'}
          </Link>
        </div>
      </div>
    </section>
  );
}
