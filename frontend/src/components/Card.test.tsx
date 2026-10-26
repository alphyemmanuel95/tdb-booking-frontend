import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import { Card } from './Card';
import { SectionHeading } from './SectionHeading';

describe('Card', () => {
  it('shows a decorative step number that does not change the heading name', () => {
    renderWithProviders(
      <Card step={2}>
        <SectionHeading>Choose a slot</SectionHeading>
      </Card>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Choose a slot' })).toBeInTheDocument();
    expect(screen.getByText('2')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders no step badge without a step', () => {
    renderWithProviders(
      <Card>
        <p>Content</p>
      </Card>,
    );
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
