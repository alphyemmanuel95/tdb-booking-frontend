import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiError } from './errors';

/**
 * Shared RTK Query API. Features add endpoints with `baseApi.injectEndpoints`
 * so there is a single cache, middleware and reducer. There is no HTTP backend:
 * endpoints use `queryFn` to call the in-memory mock API.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: ['Slots', 'Bookings'],
  endpoints: () => ({}),
});
