import type { SerializedError } from '@reduxjs/toolkit';
import { MockApiError, type MockApiErrorCode } from './mockApi';

/** Error shape returned by every endpoint's `queryFn`. */
export interface ApiError {
  message: string;
  /** `NETWORK` means the outcome is unknown and retrying is sensible; `UNKNOWN` is unexpected. */
  code: MockApiErrorCode | 'UNKNOWN';
}

/** Runs a mock API call and converts it into an RTK Query `queryFn` result. */
export async function toQueryResult<T>(
  call: () => Promise<T>,
): Promise<{ data: T } | { error: ApiError }> {
  try {
    return { data: await call() };
  } catch (error) {
    if (error instanceof MockApiError) {
      return { error: { message: error.message, code: error.code } };
    }
    return {
      error: {
        message: error instanceof Error ? error.message : 'Something went wrong.',
        code: 'UNKNOWN',
      },
    };
  }
}

/** Turns an RTK Query error into a message that is safe to show to users. */
export function getErrorMessage(error: ApiError | SerializedError | undefined): string {
  return error?.message ?? 'Something went wrong.';
}

/** True when the request may not have reached the server, so retrying it unchanged makes sense. */
export function isRetryableError(error: ApiError | SerializedError | undefined): boolean {
  return error !== undefined && 'code' in error && error.code === 'NETWORK';
}
