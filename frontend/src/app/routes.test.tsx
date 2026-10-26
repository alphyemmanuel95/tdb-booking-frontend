import { describe, expect, it } from 'vitest';
import { renderApp, screen } from '@/test/test-utils';

describe('routing', () => {
  it('renders the booking page at /', async () => {
    renderApp({ route: '/' });

    expect(screen.getByRole('heading', { level: 1, name: 'Book darshan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book darshan' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(await screen.findByRole('combobox', { name: 'Temple' })).toBeInTheDocument();
  });

  it('renders the not-found page for unknown URLs', async () => {
    const { user } = renderApp({ route: '/does-not-exist' });

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Go back home' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Book darshan' })).toBeInTheDocument();
  });
});
