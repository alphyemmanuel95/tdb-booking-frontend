export type Language = 'en' | 'ml';

export interface LanguageOption {
  value: Language;
  /** The language's own name, shown in that language so its speakers can find it. */
  name: string;
}

export const LANGUAGES: readonly LanguageOption[] = [
  { value: 'en', name: 'English' },
  { value: 'ml', name: 'മലയാളം' },
];

export const DEFAULT_LANGUAGE: Language = 'en';

const STORAGE_KEY = 'tdb-darshan.language';

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ml';
}

/** Intl locale for dates and times. Times are still shown in IST whatever the locale. */
export function localeFor(language: Language): string {
  switch (language) {
    case 'en':
      return 'en-IN';
    case 'ml':
      return 'ml-IN';
  }
}

/** The remembered language, or the default when storage is empty, invalid or unavailable. */
export function readStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    // Storage can throw (private mode, blocked storage); the default language still works.
    return DEFAULT_LANGUAGE;
  }
}

export function storeLanguage(language: Language): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Not remembering the choice is acceptable; the switch still works for this visit.
  }
}
