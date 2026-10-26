import type { RouteObject } from 'react-router';
import { RootLayout } from '@/app/RootLayout';
import { BookingPage } from '@/pages/BookingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <BookingPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
