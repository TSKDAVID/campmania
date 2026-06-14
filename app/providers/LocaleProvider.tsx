import {createContext, useContext, useMemo, useState, type ReactNode} from 'react';
import {
  DEFAULT_LOCALE,
  getTranslations,
  t,
  type Locale,
} from '~/lib/trailrent/i18n';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: ReturnType<typeof getTranslations>;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale = DEFAULT_LOCALE,
  children,
}: {
  initialLocale?: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next;
      document.cookie = `trailrent_locale=${next};path=/;max-age=31536000`;
    }
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      translations: getTranslations(locale),
      t: (key: string) => t(locale, key),
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}

export function getLocaleFromRequest(request: Request): Locale {
  const cookie = request.headers.get('Cookie') ?? '';
  const match = cookie.match(/trailrent_locale=(ka|en)/);
  if (match?.[1] === 'en' || match?.[1] === 'ka') return match[1];
  return DEFAULT_LOCALE;
}
