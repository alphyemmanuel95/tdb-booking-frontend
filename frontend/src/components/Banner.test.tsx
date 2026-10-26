import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import { Banner } from './Banner';

describe('Banner', () => {
  it('shows the title and message and keeps the tone icon out of the accessible text', () => {
    renderWithProviders(
      <Banner role="alert" tone="error" title="Booking failed">
        <p>Only 2 tickets are left</p>
      </Banner>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Booking failed');
    expect(alert).toHaveTextContent('Only 2 tickets are left');
    expect(alert.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['success', 'info'] as const)('renders the %s tone without a title', (tone) => {
    renderWithProviders(
      <Banner role="status" tone={tone}>
        <p>Message</p>
      </Banner>,
    );
    expect(screen.getByRole('status')).toHaveTextContent(/^Message$/);
  });
});
