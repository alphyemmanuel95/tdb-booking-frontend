import type { HttpHandler } from 'msw';

/**
 * The app talks to an in-memory mock API (`src/api/mockApi.ts`), not HTTP. MSW stays in place
 * with no handlers so any accidental real network request fails the test.
 */
export const handlers: HttpHandler[] = [];
