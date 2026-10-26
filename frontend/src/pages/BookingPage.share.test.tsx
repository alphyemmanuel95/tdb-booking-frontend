import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetMockApi } from '@/api/mockApi';
import { formatIstDate } from '@/lib/datetime';
import { createTestSeed, TOMORROW } from '@/test/bookingSeed';
import { renderApp, screen } from '@/test/test-utils';

// Other params on the page URL (e.g. the dev-only failure switch) must not end up in the link.
const ROUTE = `/?temple=sabarimala&date=${TOMORROW}&failureRate=0`;
const SHARED_URL = `${window.location.origin}/?temple=sabarimala&date=${TOMORROW}`;

function renderAt(route: string) {
  resetMockApi(createTestSeed());
  return renderApp({ route });
}

afterEach(() => {
  Reflect.deleteProperty(navigator, 'share');
});

describe('BookingPage share button', () => {
  it('is only offered once a temple is chosen', async () => {
    renderAt('/');
    await screen.findByRole('combobox', { name: 'Temple' });

    expect(screen.queryByRole('button', { name: 'Share these slots' })).not.toBeInTheDocument();
  });

  it('copies a link with only the temple and date and says so', async () => {
    const { user } = renderAt(ROUTE);

    await user.click(await screen.findByRole('button', { name: 'Share these slots' }));

    expect(await screen.findByText(/Link copied/)).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe(SHARED_URL);
  });

  it('opens the native share sheet where the browser has one', async () => {
    const share = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });
    const { user } = renderAt(ROUTE);

    await user.click(await screen.findByRole('button', { name: 'Share these slots' }));

    const title = `Sabarimala darshan slots for ${formatIstDate(TOMORROW)}`;
    expect(share).toHaveBeenCalledWith({ title, text: title, url: SHARED_URL });
    expect(screen.queryByText(/Link copied/)).not.toBeInTheDocument();
  });
});
