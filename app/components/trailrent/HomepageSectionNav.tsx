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
const SCROLL_PIN_RELEASE_MS = 120;

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
  const scrollTargetRef = useRef<SectionId | null>(null);
  const pinReleaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const labels: Record<SectionId, string> = {
    'home-hero': tr.home.sectionNav.hero,
    'home-gear': tr.home.sectionNav.gear,
    'home-packages': tr.home.sectionNav.packages,
    'home-steps': tr.home.sectionNav.steps,
  };

  useEffect(() => {
    const syncActive = () => {
      if (scrollTargetRef.current) {
        setActiveId(scrollTargetRef.current);
        return;
      }
      setActiveId(getActiveSection());
    };

    const releaseScrollPin = () => {
      if (pinReleaseTimerRef.current) {
        clearTimeout(pinReleaseTimerRef.current);
        pinReleaseTimerRef.current = null;
      }
      scrollTargetRef.current = null;
      setActiveId(getActiveSection());
    };

    const bumpPinRelease = () => {
      if (!scrollTargetRef.current) return;
      if (pinReleaseTimerRef.current) {
        clearTimeout(pinReleaseTimerRef.current);
      }
      pinReleaseTimerRef.current = setTimeout(
        releaseScrollPin,
        SCROLL_PIN_RELEASE_MS,
      );
    };

    const onScroll = () => {
      if (scrollTargetRef.current) bumpPinRelease();

      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        syncActive();
      });
    };

    const onScrollEnd = () => {
      if (scrollTargetRef.current) releaseScrollPin();
    };

    syncActive();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', syncActive, {passive: true});
    window.addEventListener('scrollend', onScrollEnd, {passive: true});

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', syncActive);
      window.removeEventListener('scrollend', onScrollEnd);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (pinReleaseTimerRef.current) {
        clearTimeout(pinReleaseTimerRef.current);
      }
    };
  }, []);

  const scrollTo = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    if (!el) return;

    const top =
      el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX;
    const alreadyAtTarget = Math.abs(window.scrollY - top) < 2;

    setActiveId(id);

    if (alreadyAtTarget) {
      scrollTargetRef.current = null;
      return;
    }

    scrollTargetRef.current = id;
    window.scrollTo({top, behavior: 'smooth'});
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
