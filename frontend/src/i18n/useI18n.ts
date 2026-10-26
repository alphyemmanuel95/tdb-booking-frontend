import { use } from 'react';
import { I18nContext, type I18n } from './I18nContext';

/** Current language, its messages (`t`) and IST date/time formatters for that language. */
export function useI18n(): I18n {
  return use(I18nContext);
}
