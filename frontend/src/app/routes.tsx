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
      {
        path: 'my-bookings',
        lazy: async () => {
          const { MyBookingsPage } = await import('@/pages/MyBookingsPage');
          return { Component: MyBookingsPage };
        },
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
