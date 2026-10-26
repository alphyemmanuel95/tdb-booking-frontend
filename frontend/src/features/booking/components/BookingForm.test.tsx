import { describe, expect, it, vi } from 'vitest';
import { configureMockApi, createBooking, getBookings, resetMockApi } from '@/api/mockApi';
import type { Slot } from '@/api/types';
import { createTestSeed } from '@/test/bookingSeed';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/test/test-utils';
import { BookingForm } from './BookingForm';

const PHONE = '9876543210';

type User = ReturnType<typeof renderWithProviders>['user'];

function openSlot(): Slot {
  const slot = createTestSeed().slots.find((candidate) => candidate.id === 'open');
  if (!slot) throw new Error('The test seed has no "open" slot.');
  return slot;
}

function renderForm() {
  resetMockApi(createTestSeed());
  const onBooked = vi.fn();
  return {
    onBooked,
    ...renderWithProviders(<BookingForm slot={openSlot()} onBooked={onBooked} />),
  };
}

async function fillForm(user: User, tickets = '3') {
  await user.type(screen.getByLabelText('Name'), 'Anil Kumar');
  await user.type(screen.getByLabelText('Phone number'), PHONE);
  const ticketsInput = screen.getByLabelText('Number of tickets');
  await user.clear(ticketsInput);
  await user.type(ticketsInput, tickets);
}

/** Reads bookings from a reliable mock, whatever failure rate the test configured. */
async function bookingCount() {
  configureMockApi({ failureRate: 0 });
  return (await getBookings(PHONE)).length;
}

describe('BookingForm', () => {
  it('creates one booking when Book is double-clicked during a slow request', async () => {
    configureMockApi({ minDelayMs: 100, maxDelayMs: 100 });
    const { user, onBooked } = renderForm();
    await fillForm(user);

    await user.dblClick(screen.getByRole('button', { name: 'Book tickets' }));
    expect(screen.getByRole('button', { name: 'Booking…' })).toBeDisabled();

    await waitFor(() => {
      expect(onBooked).toHaveBeenCalledTimes(1);
    });
    expect(await bookingCount()).toBe(1);
  });

  it('creates one booking when Enter is pressed twice quickly', async () => {
    configureMockApi({ minDelayMs: 100, maxDelayMs: 100 });
    const { user, onBooked } = renderForm();
    await fillForm(user);

    await user.type(screen.getByLabelText('Name'), '{Enter}{Enter}');

    await waitFor(() => {
      expect(onBooked).toHaveBeenCalledTimes(1);
    });
    expect(await bookingCount()).toBe(1);
  });

  it('creates one booking when two submits arrive before React re-renders', async () => {
    const { user, onBooked } = renderForm();
    await fillForm(user);

    const form = screen.getByRole('form', { name: 'Devotee details' });
    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onBooked).toHaveBeenCalledTimes(1);
    });
    expect(await bookingCount()).toBe(1);
  });

  it('keeps the typed values after a failed booking and books on retry', async () => {
    const { user, onBooked } = renderForm();
    await fillForm(user);

    configureMockApi({ failureRate: 1 });
    await user.click(screen.getByRole('button', { name: 'Book tickets' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Network error');
    expect(screen.getByLabelText('Name')).toHaveValue('Anil Kumar');
    expect(screen.getByLabelText('Phone number')).toHaveValue(PHONE);
    expect(screen.getByLabelText('Number of tickets')).toHaveValue(3);

    configureMockApi({ failureRate: 0 });
    await user.click(screen.getByRole('button', { name: 'Book tickets' }));

    await waitFor(() => {
      expect(onBooked).toHaveBeenCalledWith(expect.objectContaining({ tickets: 3 }));
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(await bookingCount()).toBe(1);
  });

  it('does not book twice when retrying after the response was lost', async () => {
    const { user, onBooked } = renderForm();
    await fillForm(user);

    // The server books the tickets, but the devotee only sees a network error.
    configureMockApi({ failureRate: 1, lostResponseShare: 1 });
    await user.click(screen.getByRole('button', { name: 'Book tickets' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Network error');
    expect(await bookingCount()).toBe(1);

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => {
      expect(onBooked).toHaveBeenCalledWith(expect.objectContaining({ id: 'BK-0001' }));
    });
    expect(await bookingCount()).toBe(1);
  });

  it('treats edited details after a failure as a new booking', async () => {
    const { user, onBooked } = renderForm();
    await fillForm(user);
    configureMockApi({ failureRate: 1 });
    await user.click(screen.getByRole('button', { name: 'Book tickets' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Network error');

    configureMockApi({ failureRate: 0 });
    const ticketsInput = screen.getByLabelText('Number of tickets');
    await user.clear(ticketsInput);
    await user.type(ticketsInput, '2');
    await user.click(screen.getByRole('button', { name: 'Book tickets' }));

    await waitFor(() => {
      expect(onBooked).toHaveBeenCalledWith(expect.objectContaining({ tickets: 2 }));
    });
  });

  it('does not offer a retry when the server rejects the booking', async () => {
    const { user, onBooked } = renderForm();
    // Another devotee books 8 tickets after this form loaded the slot.
    await createBooking({ slotId: 'open', name: 'Other', phone: '9123456780', tickets: 8 });
    await fillForm(user);

    await user.click(screen.getByRole('button', { name: 'Book tickets' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Only 2 tickets are left');
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
    expect(onBooked).not.toHaveBeenCalled();
  });
});
