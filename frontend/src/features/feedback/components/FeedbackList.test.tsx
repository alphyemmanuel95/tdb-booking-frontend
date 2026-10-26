import { describe, expect, it } from 'vitest';
import { feedbackHandlers } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen, within } from '@/test/test-utils';
import { FeedbackList } from './FeedbackList';

describe('FeedbackList', () => {
  it('shows a loading indicator while the request is pending', () => {
    server.use(feedbackHandlers.loadingForever());
    renderWithProviders(<FeedbackList />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading feedback…');
  });

  it('renders feedback returned by the API', async () => {
    renderWithProviders(<FeedbackList />);

    const list = await screen.findByRole('list', { name: 'Feedback' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Ada Lovelace');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an empty state when there is no feedback', async () => {
    server.use(feedbackHandlers.empty());
    renderWithProviders(<FeedbackList />);

    expect(await screen.findByText(/no feedback yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows an error with a retry button when the server fails, and recovers on retry', async () => {
    server.use(feedbackHandlers.serverError());
    const { user } = renderWithProviders(<FeedbackList />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not load feedback');
    expect(alert).toHaveTextContent('The server had a problem');

    server.resetHandlers(); // back to the happy-path handlers
    await user.click(within(alert).getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('list', { name: 'Feedback' })).toBeInTheDocument();
  });

  it('shows a connection message on network errors', async () => {
    server.use(feedbackHandlers.networkError());
    renderWithProviders(<FeedbackList />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
  });
});
