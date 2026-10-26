import type { SerializedError } from '@reduxjs/toolkit';

/** Error shape returned by every endpoint's `queryFn`. */
export interface ApiError {
  message: string;
}

/** Runs a mock API call and converts it into an RTK Query `queryFn` result. */
export async function toQueryResult<T>(
  call: () => Promise<T>,
): Promise<{ data: T } | { error: ApiError }> {
  try {
    return { data: await call() };
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : 'Something went wrong.' } };
  }
}

/** Turns an RTK Query error into a message that is safe to show to users. */
export function getErrorMessage(error: ApiError | SerializedError | undefined): string {
  return error?.message ?? 'Something went wrong.';
}
