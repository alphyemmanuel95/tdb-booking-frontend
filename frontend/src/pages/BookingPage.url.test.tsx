import { describe, expect, it } from 'vitest';
import { configureMockApi, resetMockApi } from '@/api/mockApi';
import { bookingApi } from '@/features/booking/bookingApi';
import { addDays } from '@/lib/datetime';
import { createTestSeed, TODAY, TOMORROW } from '@/test/bookingSeed';
import { act, renderApp, screen, waitFor } from '@/test/test-utils';

function renderAt(route: string) {
  resetMockApi(createTestSeed());
  return renderApp({ route });
}

const templeSelect = () => screen.findByRole('combobox', { name: 'Temple' });
const dateSelect = () => screen.getByRole('combobox', { name: 'Date' });

describe('BookingPage temple and date in the URL', () => {
  it('opens a shared link with its temple and date selected', async () => {
    renderAt(`/?temple=sabarimala&date=${TOMORROW}`);

    expect(await screen.findByRole('radio', { name: /10 of 20 tickets remaining/ })).toBeEnabled();
    expect(await templeSelect()).toHaveValue('sabarimala');
    expect(dateSelect()).toHaveValue(TOMORROW);
  });

  it('writes each change to the URL and restores the previous selection on Back', async () => {
    const { router, user } = renderAt('/');

    await user.selectOptions(await templeSelect(), 'Sabarimala');
    expect(router.state.location.search).toBe(`?temple=sabarimala&date=${TODAY}`);
    await user.selectOptions(dateSelect(), TOMORROW);
    expect(router.state.location.search).toBe(`?temple=sabarimala&date=${TOMORROW}`);
    expect(await screen.findByRole('radio', { name: /10 of 20 tickets remaining/ })).toBeEnabled();

    await act(() => router.navigate(-1));
    expect(router.state.location.search).toBe(`?temple=sabarimala&date=${TODAY}`);
    expect(dateSelect()).toHaveValue(TODAY);
    expect(
      await screen.findByRole('radio', { name: /Already started, booking closed/ }),
    ).toBeDisabled();

    await act(() => router.navigate(-1));
    expect(await templeSelect()).toHaveValue('');
    expect(screen.getByText('Choose a temple to see its darshan slots.')).toBeInTheDocument();
  });

  it.each([
    ['an unknown temple', `/?temple=atlantis&date=${TOMORROW}`, '', TOMORROW],
    ['a malformed date', '/?temple=sabarimala&date=not-a-date', 'sabarimala', TODAY],
    ['a past date', `/?temple=sabarimala&date=${addDays(TODAY, -1)}`, 'sabarimala', TODAY],
    ['a date beyond 7 days', `/?temple=sabarimala&date=${addDays(TODAY, 7)}`, 'sabarimala', TODAY],
  ])('falls back sensibly for %s', async (_case, route, temple, date) => {
    renderAt(route);

    // The temple select only renders once temples have loaded, i.e. once the param is validated.
    expect(await templeSelect()).toHaveValue(temple);
    expect(dateSelect()).toHaveValue(date);
  });

  it('never shows slots for a selection already left when its response arrives late', async () => {
    // The earlier selection (Sabarimala) answers after the later one (Guruvayur).
    configureMockApi({
      getSlotsDelayMs: (templeId) => (templeId === 'sabarimala' ? 200 : 20),
    });
    const { store, user } = renderAt(`/?temple=sabarimala&date=${TOMORROW}`);

    await user.selectOptions(await templeSelect(), 'Guruvayur');
    expect(await screen.findByText(/No darshan slots on this day/)).toBeInTheDocument();

    // Wait until the slow, stale Sabarimala response has really arrived.
    const selectStale = bookingApi.endpoints.getSlots.select({
      templeId: 'sabarimala',
      date: TOMORROW,
    });
    await waitFor(() => {
      expect(selectStale(store.getState()).status).toBe('fulfilled');
    });

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.getByText(/No darshan slots on this day/)).toBeInTheDocument();
    expect(await templeSelect()).toHaveValue('guruvayur');
  });

  it('does not keep showing the previous selection while the new one loads', async () => {
    configureMockApi({ getSlotsDelayMs: (templeId) => (templeId === 'guruvayur' ? 200 : 0) });
    const { user } = renderAt(`/?temple=sabarimala&date=${TOMORROW}`);
    expect(await screen.findByRole('radio', { name: /10 of 20 tickets remaining/ })).toBeEnabled();

    await user.selectOptions(await templeSelect(), 'Guruvayur');

    expect(screen.getByText('Loading slots…')).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(await screen.findByText(/No darshan slots on this day/)).toBeInTheDocument();
  });
});
