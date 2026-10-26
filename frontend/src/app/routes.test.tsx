import { describe, expect, it } from 'vitest';
import { renderApp, screen, within } from '@/test/test-utils';

describe('routing', () => {
  it('renders the home page at /', () => {
    renderApp({ route: '/' });

    expect(screen.getByRole('heading', { level: 1, name: 'React Starter' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it('navigates to the feedback page from the main navigation', async () => {
    const { user, router } = renderApp({ route: '/' });

    const nav = screen.getByRole('navigation', { name: 'Main' });
    await user.click(within(nav).getByRole('link', { name: 'Feedback' }));

    // The feedback route is lazy-loaded, so wait for it to appear.
    expect(await screen.findByRole('heading', { level: 1, name: 'Feedback' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/feedback');
    expect(await screen.findByRole('list', { name: 'Feedback' })).toBeInTheDocument();
  });

  it('renders the not-found page for unknown URLs', async () => {
    const { user } = renderApp({ route: '/does-not-exist' });

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Go back home' }));
    expect(screen.getByRole('heading', { level: 1, name: 'React Starter' })).toBeInTheDocument();
  });
});
