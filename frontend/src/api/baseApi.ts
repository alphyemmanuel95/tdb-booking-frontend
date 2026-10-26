import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/app/env';

/**
 * Shared RTK Query API. Features add endpoints with `baseApi.injectEndpoints`
 * so there is a single cache, middleware and reducer.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Feedback'],
  endpoints: () => ({}),
});
