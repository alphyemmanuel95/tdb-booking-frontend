import { describe, expect, it } from 'vitest';
import { configureMockApi, createBooking, getBookings, resetMockApi } from '@/api/mockApi';
import { createTestSeed, TODAY, TOMORROW } from '@/test/bookingSeed';
import { renderWithProviders, screen, within } from '@/test/test-utils';
import { BookingPage } from './BookingPage';

type User = ReturnType<typeof renderWithProviders>['user'];

async function chooseTempleAndDate(user: User, temple = 'Sabarimala') {
  const templeSelect = await screen.findByRole('combobox', { name: 'Temple' });
  await user.selectOptions(templeSelect, temple);
  await user.selectOptions(screen.getByRole('combobox', { name: 'Date' }), TOMORROW);
}

async function fillForm(user: User, tickets: string) {
  await user.type(screen.getByLabelText('Name'), 'Anil Kumar');
  await user.type(screen.getByLabelText('Phone number'), '9876543210');
  const ticketsInput = screen.getByLabelText('Number of tickets');
  await user.clear(ticketsInput);
  await user.type(ticketsInput, tickets);
}

function renderPage() {
  resetMockApi(createTestSeed());
  return renderWithProviders(<BookingPage />);
}

describe('BookingPage', () => {
  it('books 3 tickets in a slot with 10 remaining and then shows 7 remaining', async () => {
    const { user } = renderPage();
    await chooseTempleAndDate(user);

    await user.click(await screen.findByRole('radio', { name: /10 of 20 tickets remaining/ }));
    await fillForm(user, '3');
    await user.click(screen.getByRole('button', { name: 'Book tickets' }));

    expect(
      await screen.findByText(/Booked 3 tickets for Anil Kumar at Sabarimala/),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /7 of 20 tickets remaining/ })).toBeChecked();
    // The form stays on the slot, cleared, with the new limit.
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Number of tickets')).toHaveAccessibleDescription(
      'Up to 7 tickets',
    );
  });

  it('refreshes the slot when a booking is rejected because tickets sold meanwhile', async () => {
    const { user } = renderPage();
    await chooseTempleAndDate(user);
    await user.click(await screen.findByRole('radio', { name: /10 of 20 tickets remaining/ }));
    // Another devotee books 8 tickets after this page loaded the slot list.
    await createBooking({ slotId: 'open', name: 'Other', phone: '9123456780', tickets: 8 });

    await fillForm(user, '3');
    await user.click(screen.getByRole('button', { name: 'Book tickets' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Only 2 tickets are left');
    expect(
      await screen.findByRole('radio', { name: /2 of 20 tickets remaining/, checked: true }),
    ).toBeInTheDocument();
  });

  it('shows an error when temples fail to load and recovers on retry', async () => {
    configureMockApi({ failureRate: 1 });
    const { user } = renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load temples');
    configureMockApi({ failureRate: 0 });
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('combobox', { name: 'Temple' })).toBeInTheDocument();
  });

  it('does not allow more tickets than remain in the slot', async () => {
    const { user } = renderPage();
    await chooseTempleAndDate(user);

    await user.click(await screen.findByRole('radio', { name: /2 of 20 tickets remaining/ }));
    await fillForm(user, '3');
    await user.click(screen.getByRole('button', { name: 'Book tickets' }));

    expect(screen.getByLabelText('Number of tickets')).toHaveAccessibleDescription(
      'Up to 2 tickets You can book at most 2 tickets in this slot',
    );
    expect(await getBookings('9876543210')).toHaveLength(0);
  });

  it('disables full and started slots and says why', async () => {
    const { user } = renderPage();
    await chooseTempleAndDate(user);

    expect(await screen.findByRole('radio', { name: /Full, no tickets left/ })).toBeDisabled();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Date' }), TODAY);
    expect(
      await screen.findByRole('radio', { name: /Already started, booking closed/ }),
    ).toBeDisabled();
  });

  it('shows an empty state when a temple has no slots that day', async () => {
    const { user } = renderPage();
    await chooseTempleAndDate(user, 'Guruvayur');

    expect(await screen.findByText(/No darshan slots on this day/)).toBeInTheDocument();
  });

  it('shows a loading state while temples load', async () => {
    renderPage();

    // The first render happens before the (zero-delay) mock call resolves.
    expect(screen.getByText('Loading temples…')).toBeInTheDocument();
    expect(await screen.findByRole('combobox', { name: 'Temple' })).toBeInTheDocument();
  });

  it('shows an error when slots fail to load and recovers on retry', async () => {
    const { user } = renderPage();
    await screen.findByRole('combobox', { name: 'Temple' });

    configureMockApi({ failureRate: 1 });
    await chooseTempleAndDate(user);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load slots');

    configureMockApi({ failureRate: 0 });
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('radio', { name: /10 of 20 tickets remaining/ })).toBeEnabled();
  });

  it('keeps the typed values when booking fails', async () => {
    const { user } = renderPage();
    await chooseTempleAndDate(user);
    await user.click(await screen.findByRole('radio', { name: /10 of 20 tickets remaining/ }));
    await fillForm(user, '3');

    configureMockApi({ failureRate: 1 });
    await user.click(screen.getByRole('button', { name: 'Book tickets' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Booking failed');
    expect(screen.getByLabelText('Name')).toHaveValue('Anil Kumar');
    expect(screen.getByLabelText('Number of tickets')).toHaveValue(3);
  });

  it('retries a lost booking that took the last tickets without booking twice', async () => {
    const { user } = renderPage();
    await chooseTempleAndDate(user);
    await user.click(await screen.findByRole('radio', { name: /2 of 20 tickets remaining/ }));
    await fillForm(user, '2');

    // The server saves the booking, but the response is lost (and the slots refresh fails too).
    configureMockApi({ failureRate: 1, lostResponseShare: 1 });
    await user.click(screen.getByRole('button', { name: 'Book tickets' }));
    const form = screen.getByRole('form', { name: 'Devotee details' });
    expect(await within(form).findByRole('alert')).toHaveTextContent('Network error');

    // The network recovers; reloading the slots now counts the saved booking, so the slot is full.
    expect(await screen.findByText('Could not load slots')).toBeInTheDocument();
    configureMockApi({ failureRate: 0 });
    const [reloadSlots] = (await screen.findAllByRole('button', { name: 'Try again' })).filter(
      (button) => !form.contains(button),
    );
    if (reloadSlots) await user.click(reloadSlots);
    expect(
      await screen.findByRole('radio', { name: /Full, no tickets left/, checked: true }),
    ).toBeDisabled();

    // The form is still there with the same details, and the retry is not blocked by the new count.
    expect(screen.getByLabelText('Name')).toHaveValue('Anil Kumar');
    await user.click(within(form).getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText(/Booked 2 tickets for Anil Kumar/)).toBeInTheDocument();
    expect(await getBookings('9876543210')).toHaveLength(1);
  });
});
