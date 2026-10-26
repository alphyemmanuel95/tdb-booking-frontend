import { describe, expect, it } from 'vitest';
import { configureMockApi, getBookings, resetMockApi } from '@/api/mockApi';
import { createTestSeed, TODAY, TOMORROW } from '@/test/bookingSeed';
import { renderWithProviders, screen } from '@/test/test-utils';
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

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Booked 3 tickets for Anil Kumar at Sabarimala',
    );
    expect(screen.getByRole('radio', { name: /7 of 20 tickets remaining/ })).toBeInTheDocument();
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

  it('shows a loading state while temples load', () => {
    configureMockApi({ minDelayMs: 60_000, maxDelayMs: 60_000 });
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Loading temples…');
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
});
