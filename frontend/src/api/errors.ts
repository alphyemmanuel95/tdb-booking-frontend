import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/** Turns an RTK Query error into a message that is safe to show to users. */
export function getErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) return 'Something went wrong.';
  if ('status' in error) {
    if (error.status === 'FETCH_ERROR') return 'Unable to reach the server. Check your connection.';
    if (typeof error.status === 'number' && error.status >= 500) {
      return 'The server had a problem. Please try again.';
    }
    return hasMessage(error.data) ? error.data.message : 'The request failed. Please try again.';
  }
  return error.message ?? 'Something went wrong.';
}

function hasMessage(data: unknown): data is { message: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string'
  );
}
