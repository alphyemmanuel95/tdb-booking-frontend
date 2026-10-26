import type { Booking } from '@/api/types';
import { useNow } from '@/hooks/useNow';
import { useI18n } from '@/i18n/useI18n';
import { BookingItem } from './BookingItem';

interface BookingListProps {
  bookings: Booking[];
  phone: string;
}

export function BookingList({ bookings, phone }: BookingListProps) {
  // Ticking clock so a booking stops being cancellable once its slot starts.
  const now = useNow();
  const { t } = useI18n();
  return (
    <ul aria-label={t.myBookings.listLabel} className="space-y-4">
      {bookings.map((booking) => (
        <BookingItem key={booking.id} booking={booking} phone={phone} now={now} />
      ))}
    </ul>
  );
}
