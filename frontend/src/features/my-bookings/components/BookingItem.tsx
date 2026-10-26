import { useId, useRef } from 'react';
import { getErrorMessage } from '@/api/errors';
import type { Booking, BookingStatus } from '@/api/types';
import { ErrorMessage } from '@/components/ErrorMessage';
import { formatIstDate, formatIstTime } from '@/lib/datetime';
import { getCancelAvailability } from '../cancelAvailability';
import { useCancelBookingMutation } from '../myBookingsApi';
import { CancelAction } from './CancelAction';

const STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

interface BookingItemProps {
  booking: Booking;
  /** The phone the list was looked up with; identifies the cached list to update. */
  phone: string;
  now: number;
}

export function BookingItem({ booking, phone, now }: BookingItemProps) {
  const headingId = useId();
  const itemRef = useRef<HTMLLIElement>(null);
  const [cancelBooking, { error }] = useCancelBookingMutation();

  const handleConfirmCancel = () => {
    // The confirm buttons disappear once the booking shows as cancelled; keep focus on the booking.
    itemRef.current?.focus();
    void cancelBooking({ bookingId: booking.id, phone });
  };

  return (
    <li
      ref={itemRef}
      tabIndex={-1}
      aria-labelledby={headingId}
      className="space-y-3 rounded-md border border-slate-300 bg-white p-4"
    >
      <h2 id={headingId} className="text-lg font-semibold">
        {booking.templeName}
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-slate-600">Date</dt>
        <dd>{formatIstDate(booking.date)}</dd>
        <dt className="text-slate-600">Start time</dt>
        <dd>{formatIstTime(booking.startTime)} IST</dd>
        <dt className="text-slate-600">Tickets</dt>
        <dd>{booking.tickets}</dd>
        <dt className="text-slate-600">Status</dt>
        <dd className="font-medium">{STATUS_LABELS[booking.status]}</dd>
        <dt className="text-slate-600">Booking ID</dt>
        <dd>{booking.id}</dd>
      </dl>
      {error && <ErrorMessage title="Cancellation failed" message={getErrorMessage(error)} />}
      <CancelAction
        availability={getCancelAvailability(booking, now)}
        onConfirm={handleConfirmCancel}
      />
    </li>
  );
}
