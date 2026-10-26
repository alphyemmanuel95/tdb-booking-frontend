import type { Booking } from '@/api/types';

/** Whether a booking can be cancelled right now, and if not, why. */
export type CancelAvailability = 'cancellable' | 'cancelled' | 'started';

export function getCancelAvailability(booking: Booking, now: number): CancelAvailability {
  if (booking.status === 'cancelled') return 'cancelled';
  if (Date.parse(booking.startTime) <= now) return 'started';
  return 'cancellable';
}
