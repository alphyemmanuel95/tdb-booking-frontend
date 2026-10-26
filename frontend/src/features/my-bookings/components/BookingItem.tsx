import { useId, useRef } from 'react';
import { getErrorMessage } from '@/api/errors';
import type { Booking, BookingStatus } from '@/api/types';
import { Card } from '@/components/Card';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Icon, type IconName } from '@/components/Icon';
import { useI18n } from '@/i18n/useI18n';
import { getCancelAvailability } from '../cancelAvailability';
import { useCancelBookingMutation } from '../myBookingsApi';
import { CancelAction } from './CancelAction';

// The status is always written out; colour and icon only reinforce it.
const statusClasses: Record<BookingStatus, string> = {
  confirmed: 'bg-green-50 text-green-800 ring-green-200',
  cancelled: 'bg-stone-200 text-stone-700 ring-stone-300',
};

const statusIcons: Record<BookingStatus, IconName> = {
  confirmed: 'checkCircle',
  cancelled: 'info',
};

interface BookingItemProps {
  booking: Booking;
  /** The phone the list was looked up with; identifies the cached list to update. */
  phone: string;
  now: number;
}

export function BookingItem({ booking, phone, now }: BookingItemProps) {
  const { t, formatDate, formatTime } = useI18n();
  const headingId = useId();
  const itemRef = useRef<HTMLLIElement>(null);
  const [cancelBooking, { error }] = useCancelBookingMutation();

  const handleConfirmCancel = () => {
    // The confirm buttons disappear once the booking shows as cancelled; keep focus on the booking.
    itemRef.current?.focus();
    void cancelBooking({ bookingId: booking.id, phone });
  };

  return (
    <li ref={itemRef} tabIndex={-1} aria-labelledby={headingId} className="rounded-2xl">
      <Card className="space-y-4">
        <h2 id={headingId} className="text-lg font-semibold text-stone-900">
          {booking.templeName}
        </h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-stone-600">{t.myBookings.date}</dt>
          <dd className="text-stone-900">{formatDate(booking.date)}</dd>
          <dt className="text-stone-600">{t.myBookings.startTime}</dt>
          <dd className="text-stone-900">{t.myBookings.timeIst(formatTime(booking.startTime))}</dd>
          <dt className="text-stone-600">{t.myBookings.tickets}</dt>
          <dd className="text-stone-900">{booking.tickets}</dd>
          <dt className="self-center text-stone-600">{t.myBookings.status}</dt>
          <dd>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${statusClasses[booking.status]}`}
            >
              <Icon name={statusIcons[booking.status]} className="size-4" />
              {t.myBookings.statuses[booking.status]}
            </span>
          </dd>
          <dt className="text-stone-600">{t.myBookings.bookingId}</dt>
          <dd className="font-mono text-stone-900">{booking.id}</dd>
        </dl>
        {error && (
          <ErrorMessage title={t.myBookings.cancelFailed} message={getErrorMessage(error)} />
        )}
        <CancelAction
          availability={getCancelAvailability(booking, now)}
          onConfirm={handleConfirmCancel}
        />
      </Card>
    </li>
  );
}
