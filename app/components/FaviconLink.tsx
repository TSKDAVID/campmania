import {useEffect} from 'react';
import {FAVICON_HREF} from '~/lib/favicon';

function ensureFavicon() {
  const selector = 'link[rel="icon"], link[rel="shortcut icon"]';
  let link = document.querySelector<HTMLLinkElement>(selector);

  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  link.type = 'image/svg+xml';
  link.sizes = 'any';
  if (link.getAttribute('href') !== FAVICON_HREF) {
    link.setAttribute('href', FAVICON_HREF);
  }
}

export function FaviconLink() {
  useEffect(() => {
    ensureFavicon();

    const observer = new MutationObserver(() => {
      ensureFavicon();
    });

    observer.observe(document.head, {childList: true, subtree: true});

    return () => observer.disconnect();
  }, []);

  return null;
}
