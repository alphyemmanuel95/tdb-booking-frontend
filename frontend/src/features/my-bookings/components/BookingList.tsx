import type { Booking } from '@/api/types';
import { useNow } from '@/hooks/useNow';
import { BookingItem } from './BookingItem';

interface BookingListProps {
  bookings: Booking[];
  phone: string;
}

export function BookingList({ bookings, phone }: BookingListProps) {
  // Ticking clock so a booking stops being cancellable once its slot starts.
  const now = useNow();
  return (
    <ul aria-label="Your bookings" className="space-y-3">
      {bookings.map((booking) => (
        <BookingItem key={booking.id} booking={booking} phone={phone} now={now} />
      ))}
    </ul>
  );
}
