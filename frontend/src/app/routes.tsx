import type { RouteObject } from 'react-router';
import { RootLayout } from '@/app/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'feedback',
        // Code-split feature pages so the initial bundle stays small.
        lazy: async () => ({
          Component: (await import('@/pages/FeedbackPage')).FeedbackPage,
        }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
