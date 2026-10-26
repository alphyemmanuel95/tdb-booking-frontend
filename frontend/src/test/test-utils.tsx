import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router';
import { routes } from '@/app/routes';
import { makeStore, type AppStore, type RootState } from '@/app/store';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import type { Language } from '@/i18n/languages';

interface StoreOptions {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
  /** Initial URL for the in-memory router. */
  route?: string;
  /** Interface language; defaults to the remembered one (English in a fresh test). */
  language?: Language;
}

/**
 * Renders a component inside a fresh Redux store and a MemoryRouter.
 * Returns RTL queries plus the `store` and a user-event `user`.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = makeStore(preloadedState),
    route = '/',
    language,
    ...options
  }: StoreOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <LanguageProvider initialLanguage={language}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </LanguageProvider>
      </Provider>
    );
  }
  return { store, user: userEvent.setup(), ...render(ui, { wrapper: Wrapper, ...options }) };
}

/** Renders the real application route tree at `route`, for routing and integration tests. */
export function renderApp({
  route = '/',
  preloadedState,
  store = makeStore(preloadedState),
  language,
}: StoreOptions = {}) {
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  return {
    store,
    router,
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <LanguageProvider initialLanguage={language}>
          <RouterProvider router={router} />
        </LanguageProvider>
      </Provider>,
    ),
  };
}

export * from '@testing-library/react';
