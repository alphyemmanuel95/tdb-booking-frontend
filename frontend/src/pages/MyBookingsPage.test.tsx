import { describe, expect, it } from 'vitest';
import { configureMockApi, getBookings, getSlots, resetMockApi } from '@/api/mockApi';
import type { Booking } from '@/api/types';
import { istDateTime, formatIstDate } from '@/lib/datetime';
import { createTestSeed, TODAY, TOMORROW } from '@/test/bookingSeed';
import { renderWithProviders, screen, waitFor, within } from '@/test/test-utils';
import { MyBookingsPage } from './MyBookingsPage';

const PHONE = '9876543210';

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'BK-0001',
    slotId: 'open',
    templeId: 'sabarimala',
    templeName: 'Sabarimala',
    date: TOMORROW,
    startTime: istDateTime(TOMORROW, 9).toISOString(),
    name: 'Anil Kumar',
    phone: PHONE,
    tickets: 3,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderPage(bookings: Booking[] = []) {
  resetMockApi({ ...createTestSeed(), bookings });
  return renderWithProviders(<MyBookingsPage />);
}

async function lookUp(user: ReturnType<typeof renderPage>['user'], phone = PHONE) {
  await user.type(screen.getByLabelText('Phone number'), phone);
  await user.click(screen.getByRole('button', { name: 'Find bookings' }));
}

describe('MyBookingsPage', () => {
  it('shows the bookings for the phone number with IST date and time', async () => {
    const { user } = renderPage([
      makeBooking(),
      makeBooking({ id: 'BK-0002', phone: '9123456780', templeName: 'Guruvayur' }),
    ]);
    await lookUp(user);

    const item = await screen.findByRole('listitem', { name: 'Sabarimala' });
    expect(within(item).getByText(formatIstDate(TOMORROW))).toBeInTheDocument();
    expect(within(item).getByText('9:00 am IST')).toBeInTheDocument();
    expect(within(item).getByText('3')).toBeInTheDocument();
    expect(within(item).getByText('Confirmed')).toBeInTheDocument();
    expect(within(item).getByText('BK-0001')).toBeInTheDocument();
    // Another devotee's booking is not shown.
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('shows an empty state when the number has no bookings', async () => {
    const { user } = renderPage();
    await lookUp(user);

    expect(await screen.findByText('No bookings found for this phone number.')).toBeInTheDocument();
  });

  it('shows an error when bookings fail to load and recovers on retry', async () => {
    configureMockApi({ failureRate: 1 });
    const { user } = renderPage([makeBooking()]);
    await lookUp(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load bookings');
    configureMockApi({ failureRate: 0 });
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('listitem', { name: 'Sabarimala' })).toBeInTheDocument();
  });

  it('validates the phone number before looking up', async () => {
    const { user } = renderPage([makeBooking()]);
    await lookUp(user, '12345');

    expect(screen.getByLabelText('Phone number')).toHaveAccessibleDescription(
      'The 10-digit mobile number you booked with Enter a 10-digit Indian mobile number',
    );
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  // RTK batches store notifications to the next animation frame, so the optimistic update shows
  // a frame after the click. A short `findBy` timeout against a much slower server proves it
  // appears while the request is still in flight.
  const SLOW_SERVER_MS = 600;
  const BEFORE_SERVER = { timeout: 200 };

  it('shows the booking as cancelled before the server answers', async () => {
    const { user } = renderPage([makeBooking()]);
    await lookUp(user);
    const item = await screen.findByRole('listitem', { name: 'Sabarimala' });

    configureMockApi({ minDelayMs: SLOW_SERVER_MS, maxDelayMs: SLOW_SERVER_MS });
    await user.click(within(item).getByRole('button', { name: 'Cancel booking' }));
    await user.click(within(item).getByRole('button', { name: 'Yes, cancel booking' }));

    expect(await within(item).findByText('Cancelled', {}, BEFORE_SERVER)).toBeInTheDocument();
    expect(within(item).queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    // Once the server has answered, the booking stays cancelled.
    expect(await getBookings(PHONE)).toEqual([expect.objectContaining({ status: 'cancelled' })]);
    expect(within(item).getByText('Cancelled')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('restores the booking and shows an error when cancelling fails', async () => {
    const { user } = renderPage([makeBooking()]);
    await lookUp(user);
    const item = await screen.findByRole('listitem', { name: 'Sabarimala' });

    configureMockApi({ failureRate: 1, minDelayMs: SLOW_SERVER_MS, maxDelayMs: SLOW_SERVER_MS });
    await user.click(within(item).getByRole('button', { name: 'Cancel booking' }));
    await user.click(within(item).getByRole('button', { name: 'Yes, cancel booking' }));
    expect(await within(item).findByText('Cancelled', {}, BEFORE_SERVER)).toBeInTheDocument();

    expect(await within(item).findByRole('alert')).toHaveTextContent(
      'Cancellation failedNetwork error. Please try again.',
    );
    expect(within(item).getByText('Confirmed')).toBeInTheDocument();
    expect(within(item).getByRole('button', { name: 'Cancel booking' })).toBeEnabled();
  });

  it('cancels on retry when the first cancel reached the server but its response was lost', async () => {
    const { user } = renderPage([makeBooking()]);
    await lookUp(user);
    const item = await screen.findByRole('listitem', { name: 'Sabarimala' });

    // The server cancels the booking, but the devotee only sees a network error.
    configureMockApi({
      failureRate: 1,
      lostResponseShare: 1,
      minDelayMs: SLOW_SERVER_MS,
      maxDelayMs: SLOW_SERVER_MS,
    });
    await user.click(within(item).getByRole('button', { name: 'Cancel booking' }));
    await user.click(within(item).getByRole('button', { name: 'Yes, cancel booking' }));
    expect(await within(item).findByRole('alert')).toHaveTextContent('Network error');
    expect(within(item).getByText('Confirmed')).toBeInTheDocument();

    // Retrying succeeds rather than failing with "already cancelled".
    configureMockApi({ failureRate: 0 });
    await user.click(within(item).getByRole('button', { name: 'Cancel booking' }));
    await user.click(within(item).getByRole('button', { name: 'Yes, cancel booking' }));
    // This read is queued after the retry with the same latency, so it resolves after it.
    const open = (await getSlots('sabarimala', TOMORROW)).find((slot) => slot.id === 'open');
    // The 3 tickets went back to the slot exactly once (10 + 3).
    expect(open?.remaining).toBe(13);
    // With the server's answer in, the booking is still cancelled and no error is shown.
    await waitFor(() => {
      expect(within(item).getByText('Cancelled')).toBeInTheDocument();
    });
    expect(within(item).queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the booking when the user backs out, with focus handled for keyboard users', async () => {
    const { user } = renderPage([makeBooking()]);
    await lookUp(user);
    const item = await screen.findByRole('listitem', { name: 'Sabarimala' });

    within(item).getByRole('button', { name: 'Cancel booking' }).focus();
    await user.keyboard('{Enter}');
    expect(within(item).getByRole('group', { name: /Cancel this booking\?/ })).toBeInTheDocument();
    expect(within(item).getByRole('button', { name: 'Keep booking' })).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(within(item).getByRole('button', { name: 'Cancel booking' })).toHaveFocus();
    expect(within(item).getByText('Confirmed')).toBeInTheDocument();
    expect(await getBookings(PHONE)).toEqual([expect.objectContaining({ status: 'confirmed' })]);
  });

  it('does not offer cancel for a booking whose slot has started, and says why', async () => {
    const { user } = renderPage([
      makeBooking({
        slotId: 'started',
        date: TODAY,
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      }),
    ]);
    await lookUp(user);
    const item = await screen.findByRole('listitem', { name: 'Sabarimala' });

    expect(within(item).queryByRole('button', { name: 'Cancel booking' })).not.toBeInTheDocument();
    expect(
      within(item).getByText(/already started, so the booking can no longer be cancelled/),
    ).toBeInTheDocument();
    expect(within(item).getByText('Confirmed')).toBeInTheDocument();
  });
});
