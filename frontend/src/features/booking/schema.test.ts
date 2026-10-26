import { describe, expect, it } from 'vitest';
import { ml } from '@/i18n/ml';
import { makeBookingSchema } from './schema';

const valid = { name: 'Anil Kumar', phone: '9876543210', tickets: 2 };

describe('booking schema', () => {
  it('accepts valid details and trims text', () => {
    expect(makeBookingSchema(5).parse({ ...valid, name: '  Anil Kumar ' })).toEqual(valid);
  });

  it.each([
    [{ name: 'A' }, 'Name must be at least 2 characters'],
    [{ phone: '98765' }, 'Enter a 10-digit Indian mobile number'],
    [{ phone: '1234567890' }, 'Enter a 10-digit Indian mobile number'],
    [{ tickets: 0 }, 'Book at least 1 ticket'],
    [{ tickets: 1.5 }, 'Tickets must be a whole number'],
    [{ tickets: Number.NaN }, 'Enter the number of tickets'],
    [{ tickets: 6 }, 'You can book at most 5 tickets in this slot'],
  ])('rejects %o', (overrides, message) => {
    const result = makeBookingSchema(5).safeParse({ ...valid, ...overrides });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(message);
  });
});

describe('booking schema messages', () => {
  it('uses the given language for errors', () => {
    const result = makeBookingSchema(5, ml.validation).safeParse({ ...valid, tickets: 6 });

    expect(result.error?.issues[0]?.message).toBe('ഈ സമയത്ത് പരമാവധി 5 ടിക്കറ്റ് ബുക്ക് ചെയ്യാം');
  });
});
