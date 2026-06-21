import {useCallback, useEffect, useRef, useState} from 'react';
import {useLocale} from '~/providers/LocaleProvider';

const SECTION_IDS = [
  'home-hero',
  'home-gear',
  'home-packages',
  'home-steps',
] as const;

type SectionId = (typeof SECTION_IDS)[number];

const HEADER_OFFSET_PX = 72;
const SCROLL_OFFSET_PX = HEADER_OFFSET_PX + 16;

function getActiveSection(): SectionId {
  let current: SectionId = SECTION_IDS[0];

  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    if (top <= SCROLL_OFFSET_PX) {
      current = id;
    }
  }

  return current;
}

export function HomepageSectionNav() {
  const {translations: tr} = useLocale();
  const [activeId, setActiveId] = useState<SectionId>(SECTION_IDS[0]);
  const rafRef = useRef<number | null>(null);

  const labels: Record<SectionId, string> = {
    'home-hero': tr.home.sectionNav.hero,
    'home-gear': tr.home.sectionNav.gear,
    'home-packages': tr.home.sectionNav.packages,
    'home-steps': tr.home.sectionNav.steps,
  };

  useEffect(() => {
    const syncActive = () => {
      setActiveId(getActiveSection());
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        syncActive();
      });
    };

    syncActive();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', syncActive, {passive: true});

    const observer = new IntersectionObserver(
      () => syncActive(),
      {
        rootMargin: `-${SCROLL_OFFSET_PX}px 0px -55% 0px`,
        threshold: [0, 0.01, 0.1],
      },
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', syncActive);
      observer.disconnect();
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const scrollTo = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top =
      el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX;
    window.scrollTo({top, behavior: 'smooth'});
    setActiveId(id);
  }, []);

  return (
    <nav
      className="cm-home-scroll-nav"
      aria-label={tr.home.sectionNav.label}
    >
      <ol className="cm-home-scroll-nav-list">
        {SECTION_IDS.map((id, index) => {
          const isActive = activeId === id;
          const isLast = index === SECTION_IDS.length - 1;

          return (
            <li key={id} className="cm-home-scroll-nav-item">
              <button
                type="button"
                className={`cm-home-scroll-nav-link${isActive ? ' is-active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => scrollTo(id)}
              >
                <span className="cm-home-scroll-nav-dot" aria-hidden>
                  <span className="cm-home-scroll-nav-dot-inner" />
                </span>
                <span className="cm-home-scroll-nav-label">{labels[id]}</span>
              </button>
              {!isLast ? (
                <span className="cm-home-scroll-nav-connector" aria-hidden>
                  <span className="cm-home-scroll-nav-line" />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
