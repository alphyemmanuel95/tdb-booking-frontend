import { describe, expect, it } from 'vitest';
import { feedbackSchema } from './schema';

describe('feedbackSchema', () => {
  it('trims and accepts valid input', () => {
    const result = feedbackSchema.parse({
      name: '  Ada ',
      email: ' ada@example.com ',
      message: 'Long enough message',
    });
    expect(result).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Long enough message',
    });
  });

  it('rejects messages longer than 500 characters', () => {
    const result = feedbackSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
