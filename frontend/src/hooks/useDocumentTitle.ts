import { useEffect } from 'react';

/** Sets the browser tab title so screen-reader users hear the page change on navigation. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | TDB Darshan Booking`;
  }, [title]);
}
