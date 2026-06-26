import type {Route} from './+types/[favicon.ico]';

export function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  url.pathname = '/favicon.svg';

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.pathname,
      'Cache-Control': 'public, max-age=604800',
    },
  });
}

// Satisfy route module shape; browsers never render this.
export default function FaviconIco() {
  return null;
}
