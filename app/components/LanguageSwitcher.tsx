import {useLocale} from '~/providers/LocaleProvider';

export function LanguageSwitcher() {
  const {locale, setLocale} = useLocale();

  return (
    <div className="cm-lang-toggle" role="group" aria-label="Language">
      <button
        type="button"
        className={`cm-lang-toggle__btn${locale === 'ka' ? ' cm-lang-toggle__btn--active' : ''}`}
        onClick={() => setLocale('ka')}
        aria-pressed={locale === 'ka'}
      >
        KA
      </button>
      <button
        type="button"
        className={`cm-lang-toggle__btn${locale === 'en' ? ' cm-lang-toggle__btn--active' : ''}`}
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
    </div>
  );
}
