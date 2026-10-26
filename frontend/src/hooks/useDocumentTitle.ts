import { useEffect } from 'react';
import { useI18n } from '@/i18n/useI18n';

/** Sets the browser tab title so screen-reader users hear the page change on navigation. */
export function useDocumentTitle(title: string) {
  const { t } = useI18n();
  const fullTitle = t.app.documentTitle(title);
  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);
}
