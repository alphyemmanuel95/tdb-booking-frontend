import { delay, http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/app/env';
import { feedbackSchema } from '@/features/feedback/schema';
import type { Feedback } from '@/features/feedback/types';
import { feedbackFixtures } from './fixtures';

/** Builds a full API URL so handlers match exactly what RTK Query requests. */
export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

/** Default "happy path" handlers. Override per test with `server.use(...)`. */
export const handlers = [
  http.get(apiUrl('/feedback'), () => HttpResponse.json(feedbackFixtures)),
  http.post(apiUrl('/feedback'), async ({ request }) => {
    // Validate like a real backend would, instead of trusting a cast.
    const body = feedbackSchema.parse(await request.json());
    const created: Feedback = { id: 'new-1', createdAt: new Date().toISOString(), ...body };
    return HttpResponse.json(created, { status: 201 });
  }),
];

/** Reusable overrides for common non-happy-path scenarios. */
export const feedbackHandlers = {
  empty: () => http.get(apiUrl('/feedback'), () => HttpResponse.json([])),
  serverError: () =>
    http.get(apiUrl('/feedback'), () => HttpResponse.json({ message: 'boom' }, { status: 500 })),
  networkError: () => http.get(apiUrl('/feedback'), () => HttpResponse.error()),
  loadingForever: () =>
    http.get(apiUrl('/feedback'), async () => {
      await delay('infinite');
      return HttpResponse.json([]);
    }),
  createFails: (status = 422, message = 'Email is already registered') =>
    http.post(apiUrl('/feedback'), () => HttpResponse.json({ message }, { status })),
};
