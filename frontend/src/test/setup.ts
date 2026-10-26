import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { configureMockApi, resetMockApi } from '@/api/mockApi';
import { server } from './msw/server';

// Any request without a matching handler fails the test, so tests never hit a live backend.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
// Fresh seed data and a fast, reliable mock API per test; tests opt in to delays or failures.
beforeEach(() => {
  resetMockApi();
  configureMockApi({ failureRate: 0, minDelayMs: 0, maxDelayMs: 0 });
});
afterEach(() => {
  server.resetHandlers();
  cleanup();
  // The remembered language must not leak into the next test.
  localStorage.clear();
  document.documentElement.lang = 'en';
});
afterAll(() => {
  server.close();
});
