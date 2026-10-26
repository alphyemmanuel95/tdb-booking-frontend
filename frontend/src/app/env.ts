const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

/**
 * Absolute API base URL. Relative values are resolved against the current origin so
 * `fetch` works both in the browser and in the jsdom test environment.
 */
export const API_BASE_URL = new URL(rawApiBaseUrl, window.location.origin)
  .toString()
  .replace(/\/$/, '');
