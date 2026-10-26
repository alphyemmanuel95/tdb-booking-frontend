import { z } from 'zod';
import { phoneSchema } from '@/features/booking/schema';

export const bookingLookupSchema = z.object({ phone: phoneSchema });

export type BookingLookupValues = z.infer<typeof bookingLookupSchema>;
