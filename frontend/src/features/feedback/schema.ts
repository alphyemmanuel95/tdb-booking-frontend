import { z } from 'zod';

export const feedbackSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must be 500 characters or fewer'),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
