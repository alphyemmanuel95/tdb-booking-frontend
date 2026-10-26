import type { Feedback } from '@/features/feedback/types';

export const feedbackFixtures: Feedback[] = [
  {
    id: '1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'The example form is easy to use.',
    createdAt: '2026-01-01T10:00:00.000Z',
  },
  {
    id: '2',
    name: 'Alan Turing',
    email: 'alan@example.com',
    message: 'Validation messages are clear.',
    createdAt: '2026-01-02T10:00:00.000Z',
  },
];
