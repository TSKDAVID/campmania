import faviconSvg from '~/assets/favicon.svg?raw';

export function loader() {
  return new Response(faviconSvg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=604800',
    },
  });
}
