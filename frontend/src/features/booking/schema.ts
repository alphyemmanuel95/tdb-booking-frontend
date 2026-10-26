import { z } from 'zod';

/** Upper limit per booking, even when a slot has more tickets left. */
export const MAX_TICKETS_PER_BOOKING = 10;

/** Booking form schema; `maxTickets` is the smaller of the slot's remaining tickets and the cap. */
export function makeBookingSchema(maxTickets: number) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name must be 60 characters or fewer'),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, 'Enter a 10-digit Indian mobile number'),
    tickets: z
      .number({ error: 'Enter the number of tickets' })
      .int('Tickets must be a whole number')
      .min(1, 'Book at least 1 ticket')
      .max(maxTickets, `You can book at most ${String(maxTickets)} tickets in this slot`),
  });
}

export type BookingFormValues = z.infer<ReturnType<typeof makeBookingSchema>>;
