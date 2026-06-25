import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {useId} from 'react';
import {IconBag, IconX} from '~/components/trailrent/Icons';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const id = useId();
  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  const isCart = type === 'cart';

  return (
    <div
      aria-modal
      className={`overlay overlay--${type}${isCart ? ' overlay--cart overlay--cart-glass' : ''} ${expanded ? 'expanded' : ''}`}
      role="dialog"
      aria-labelledby={id}
      hidden={!expanded}
    >
      <button className="close-outside" onClick={close} aria-label="Close" />
      <aside className={isCart ? 'cm-cart-drawer' : 'cm-panel-drawer'}>
        <header className={isCart ? 'cm-cart-drawer__header' : 'cm-panel-drawer__header'}>
          <div className="cm-cart-drawer__header-main">
            {isCart ? (
              <span className="cm-cart-drawer__header-icon" aria-hidden>
                <IconBag size={18} />
              </span>
            ) : null}
            <h3 id={id}>{heading}</h3>
          </div>
          <button
            type="button"
            className={`close reset${isCart ? ' cm-cart-drawer__close' : ''}`}
            onClick={close}
            aria-label="Close"
          >
            {isCart ? <IconX size={20} /> : <span aria-hidden>&times;</span>}
          </button>
        </header>
        <main className={isCart ? 'cm-cart-drawer__main' : 'cm-panel-drawer__main'}>{children}</main>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
