import { createContext } from 'react';
import { formatIstDate, formatIstTime } from '@/lib/datetime';
import { en, type Messages } from './en';
import { localeFor, type Language } from './languages';
import { ml } from './ml';

const dictionaries: Record<Language, Messages> = { en, ml };

export interface I18n {
  language: Language;
  /** Intl locale for the language, e.g. `ml-IN`. */
  locale: string;
  /** Messages for the current language: `t.bookingForm.name`, `t.slots.remaining(3, 20)`. */
  t: Messages;
  /** `YYYY-MM-DD` IST date key in the current language. */
  formatDate: (dateKey: string) => string;
  /** ISO instant as an IST clock time in the current language. */
  formatTime: (iso: string) => string;
  setLanguage: (language: Language) => void;
}

export function createI18n(language: Language, setLanguage: (language: Language) => void): I18n {
  const locale = localeFor(language);
  return {
    language,
    locale,
    t: dictionaries[language],
    formatDate: (dateKey) => formatIstDate(dateKey, locale),
    formatTime: (iso) => formatIstTime(iso, locale),
    setLanguage,
  };
}

/** English without a provider, so isolated components still render sensible text. */
export const I18nContext = createContext<I18n>(createI18n('en', () => undefined));
