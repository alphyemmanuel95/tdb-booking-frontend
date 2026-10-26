import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl, feedbackHandlers } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen } from '@/test/test-utils';
import { FeedbackForm } from './FeedbackForm';

const fillValidForm = async (user: ReturnType<typeof renderWithProviders>['user']) => {
  await user.type(screen.getByLabelText('Name'), 'Grace Hopper');
  await user.type(screen.getByLabelText('Email'), 'grace@example.com');
  await user.type(screen.getByLabelText('Message'), 'Great starter project!');
};

describe('FeedbackForm', () => {
  it('shows accessible validation errors and does not call the API when invalid', async () => {
    let requests = 0;
    server.use(
      http.post(apiUrl('/feedback'), () => {
        requests += 1;
        return HttpResponse.json({});
      }),
    );
    const { user } = renderWithProviders(<FeedbackForm />);

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    const name = screen.getByLabelText('Name');
    expect(name).toBeInvalid();
    expect(name).toHaveAccessibleDescription('Name must be at least 2 characters');
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
      'Enter a valid email address',
    );
    expect(screen.getByLabelText('Message')).toHaveAccessibleDescription(
      '10–500 characters Message must be at least 10 characters',
    );
    expect(requests).toBe(0);
  });

  it('submits valid data, confirms success and clears the form', async () => {
    let received: unknown;
    server.use(
      http.post(apiUrl('/feedback'), async ({ request }) => {
        received = await request.json();
        return HttpResponse.json(
          {
            id: '9',
            name: 'Grace Hopper',
            email: 'grace@example.com',
            message: 'Great starter project!',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
          { status: 201 },
        );
      }),
    );
    const { user } = renderWithProviders(<FeedbackForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Thanks, Grace Hopper!');
    expect(received).toEqual({
      name: 'Grace Hopper',
      email: 'grace@example.com',
      message: 'Great starter project!',
    });
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('shows the server error message when submission fails and keeps the input', async () => {
    server.use(feedbackHandlers.createFails());
    const { user } = renderWithProviders(<FeedbackForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email is already registered');
    expect(screen.getByLabelText('Name')).toHaveValue('Grace Hopper');
  });
});
