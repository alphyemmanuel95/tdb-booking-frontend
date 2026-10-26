import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createI18n, I18nContext } from './I18nContext';
import { readStoredLanguage, storeLanguage, type Language } from './languages';

interface LanguageProviderProps {
  children: ReactNode;
  /** Overrides the remembered language, e.g. in tests. */
  initialLanguage?: Language | undefined;
}

/** Provides the chosen language, remembers it and keeps `<html lang>` in sync for assistive tech. */
export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(
    () => initialLanguage ?? readStoredLanguage(),
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    storeLanguage(next);
  }, []);

  const value = useMemo(() => createI18n(language, setLanguage), [language, setLanguage]);
  return <I18nContext value={value}>{children}</I18nContext>;
}
