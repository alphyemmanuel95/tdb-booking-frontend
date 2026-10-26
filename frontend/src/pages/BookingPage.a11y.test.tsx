import { describe, expect, it } from 'vitest';
import { resetMockApi } from '@/api/mockApi';
import { formatIstDate, formatIstTime, istDateTime } from '@/lib/datetime';
import { createTestSeed, TOMORROW } from '@/test/bookingSeed';
import { fireEvent, renderApp, renderWithProviders, screen, within } from '@/test/test-utils';
import { BookingPage } from './BookingPage';

/**
 * jsdom has no native `<select>` keyboard behaviour, so this fires the change a browser makes
 * when the focused select receives arrow keys. No pointer events are involved.
 */
function chooseOptionWithKeyboard(select: HTMLElement, optionName: string) {
  expect(select).toHaveFocus();
  const option = within(select).getByRole('option', { name: optionName });
  if (!(option instanceof HTMLOptionElement)) throw new Error('Expected an <option>');
  fireEvent.change(select, { target: { value: option.value } });
}

function expectEveryFieldLabelled() {
  const fields = [
    ...screen.getAllByRole('combobox'),
    ...screen.getAllByRole('radio'),
    ...screen.getAllByRole('textbox'),
    ...screen.getAllByRole('spinbutton'),
  ];
  expect(fields.length).toBeGreaterThan(0);
  for (const field of fields) expect(field).toHaveAccessibleName();
}

describe('BookingPage accessibility', () => {
  it('books tickets with the keyboard alone and moves focus to the confirmation', async () => {
    resetMockApi(createTestSeed());
    const { user } = renderWithProviders(<BookingPage />);
    const templeSelect = await screen.findByRole('combobox', { name: 'Temple' });

    await user.tab();
    chooseOptionWithKeyboard(templeSelect, 'Sabarimala');
    await user.tab();
    chooseOptionWithKeyboard(
      screen.getByRole('combobox', { name: 'Date' }),
      formatIstDate(TOMORROW),
    );

    // Tab enters the slot group on its first enabled radio; arrow keys move and select.
    const firstSlot = await screen.findByRole('radio', { name: /10 of 20 tickets remaining/ });
    await user.tab();
    expect(firstSlot).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: /2 of 20 tickets remaining/ })).toBeChecked();
    await user.keyboard('{ArrowUp}');
    expect(firstSlot).toBeChecked();

    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
    await user.keyboard('Anil Kumar');
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Phone number' })).toHaveFocus();
    await user.keyboard('9876543210');
    await user.tab();
    expect(screen.getByRole('spinbutton', { name: 'Number of tickets' })).toHaveFocus();
    await user.keyboard('{Backspace}3{Enter}');

    const confirmation = await screen.findByText(/Booked 3 tickets for Anil Kumar/);
    expect(confirmation).toHaveFocus();
    // It sits inside the persistent live region, so it is also announced.
    expect(screen.getByRole('status')).toContainElement(confirmation);
    // The next Tab goes back to the (refreshed) slot list to book again.
    await user.tab();
    expect(screen.getByRole('radio', { name: /7 of 20 tickets remaining/ })).toHaveFocus();
  });

  it('labels every form field for screen readers', async () => {
    resetMockApi(createTestSeed());
    const { user } = renderWithProviders(<BookingPage />);
    await user.selectOptions(await screen.findByRole('combobox', { name: 'Temple' }), 'Sabarimala');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Date' }), TOMORROW);
    await user.click(await screen.findByRole('radio', { name: /10 of 20 tickets remaining/ }));

    expectEveryFieldLabelled();
    expect(screen.getByRole('textbox', { name: 'Phone number' })).toHaveAccessibleDescription(
      '10-digit mobile number',
    );
    expect(screen.getByRole('form', { name: 'Devotee details' })).toBeInTheDocument();
  });

  it('switches the interface, dates and validation to Malayalam', async () => {
    resetMockApi(createTestSeed());
    const { user } = renderApp();
    await screen.findByRole('combobox', { name: 'Temple' });

    await user.click(screen.getByRole('button', { name: 'മലയാളം' }));

    expect(screen.getByRole('button', { name: 'മലയാളം' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveAttribute('lang', 'ml');
    expect(document.title).toContain('ദർശനം ബുക്ക് ചെയ്യുക');
    expect(
      screen.getByRole('heading', { level: 1, name: 'ദർശനം ബുക്ക് ചെയ്യുക' }),
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: 'ക്ഷേത്രം' }), 'Sabarimala');
    const dateSelect = screen.getByRole('combobox', { name: 'തീയതി' });
    const mlDate = formatIstDate(TOMORROW, 'ml-IN');
    expect(mlDate).not.toBe(formatIstDate(TOMORROW));
    expect(within(dateSelect).getByRole('option', { name: mlDate })).toBeInTheDocument();
    await user.selectOptions(dateSelect, TOMORROW);

    const nineAm = formatIstTime(istDateTime(TOMORROW, 9).toISOString(), 'ml-IN');
    const slot = await screen.findByRole('radio', {
      name: `${nineAm} 20-ൽ 10 ടിക്കറ്റ് ബാക്കിയുണ്ട്`,
    });
    await user.click(slot);

    expect(screen.getByRole('textbox', { name: 'പേര്' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'ഫോൺ നമ്പർ' })).toBeInTheDocument();
    expectEveryFieldLabelled();
    await user.click(screen.getByRole('button', { name: 'ടിക്കറ്റ് ബുക്ക് ചെയ്യുക' }));
    expect(await screen.findByRole('textbox', { name: 'പേര്' })).toHaveAccessibleDescription(
      'പേരിൽ കുറഞ്ഞത് 2 അക്ഷരങ്ങൾ വേണം',
    );

    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByRole('button', { name: 'Book tickets' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'en');
  });

  it('remembers the chosen language on the next visit', async () => {
    const first = renderApp();
    await first.user.click(screen.getByRole('button', { name: 'മലയാളം' }));
    first.unmount();

    renderApp();
    expect(
      screen.getByRole('heading', { level: 1, name: 'ദർശനം ബുക്ക് ചെയ്യുക' }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('combobox', { name: 'ക്ഷേത്രം' })).toBeInTheDocument();
  });
});
