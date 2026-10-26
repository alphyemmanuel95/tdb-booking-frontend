import { z } from 'zod';
import { makePhoneSchema } from '@/features/booking/schema';

/** Phone lookup schema; pass `useI18n().t.validation.phoneInvalid` to translate the error. */
export function makeBookingLookupSchema(phoneMessage?: string) {
  return z.object({ phone: makePhoneSchema(phoneMessage) });
}

export type BookingLookupValues = z.infer<ReturnType<typeof makeBookingLookupSchema>>;
