import { z } from 'zod';
import { en, type Messages } from '@/i18n/en';

/** Upper limit per booking, even when a slot has more tickets left. */
export const MAX_TICKETS_PER_BOOKING = 10;

/**
 * Booking form schema; `maxTickets` is the smaller of the slot's remaining tickets and the cap.
 * Pass `useI18n().t.validation` so errors follow the chosen language.
 */
export function makeBookingSchema(
  maxTickets: number,
  messages: Messages['validation'] = en.validation,
) {
  return z.object({
    name: z.string().trim().min(2, messages.nameTooShort).max(60, messages.nameTooLong),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, messages.phoneInvalid),
    tickets: z
      .number({ error: messages.ticketsRequired })
      .int(messages.ticketsWhole)
      .min(1, messages.ticketsMin)
      .max(maxTickets, messages.ticketsMax(maxTickets)),
  });
}

export type BookingFormValues = z.infer<ReturnType<typeof makeBookingSchema>>;
