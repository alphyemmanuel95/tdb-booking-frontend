import { useState } from 'react';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import { routes } from './routes';
import { makeStore } from './store';

const router = createBrowserRouter(routes);

export function App() {
  const [store] = useState(makeStore);
  return (
    <Provider store={store}>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </Provider>
  );
}
