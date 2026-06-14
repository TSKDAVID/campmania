import {useEffect} from 'react';

/** Keeps --site-top-height in sync with the real sticky header height. */
export function SiteTopHeightSync() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.cm-site-header');
    if (!header) return;

    const sync = () => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty(
        '--site-top-height',
        `${height}px`,
      );
    };

    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(header);
    window.addEventListener('resize', sync);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  return null;
}
