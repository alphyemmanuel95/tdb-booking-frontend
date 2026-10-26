import { useMemo, useState } from 'react';
import type { Booking } from '@/api/types';
import { useGetSlotsQuery } from '@/features/booking/bookingApi';
import { BookingForm } from '@/features/booking/components/BookingForm';
import { SlotList } from '@/features/booking/components/SlotList';
import { TempleDateFilters } from '@/features/booking/components/TempleDateFilters';
import { getSlotStatus } from '@/features/booking/slotStatus';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { formatIstDate, formatIstTime, nextIstDateKeys } from '@/lib/datetime';

const BOOKING_DAYS = 7;

export function BookingPage() {
  useDocumentTitle('Book darshan');
  const dates = useMemo(() => nextIstDateKeys(BOOKING_DAYS), []);
  const [templeId, setTempleId] = useState('');
  const [date, setDate] = useState(dates[0] ?? '');
  const [slotId, setSlotId] = useState<string | null>(null);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  const now = useNow();
  const { currentData: slots } = useGetSlotsQuery({ templeId, date }, { skip: !templeId });
  const selectedSlot = slots?.find(
    (slot) => slot.id === slotId && getSlotStatus(slot, now) === 'available',
  );

  const changeSelection = (next: { templeId?: string; date?: string }) => {
    setTempleId(next.templeId ?? templeId);
    setDate(next.date ?? date);
    setSlotId(null);
  };

  return (
    <section aria-labelledby="booking-heading" className="space-y-6">
      <h1 id="booking-heading" className="text-3xl font-bold">
        Book darshan
      </h1>
      <TempleDateFilters
        templeId={templeId}
        date={date}
        dates={dates}
        onTempleChange={(id) => {
          changeSelection({ templeId: id });
        }}
        onDateChange={(dateKey) => {
          changeSelection({ date: dateKey });
        }}
      />
      {lastBooking && (
        <p role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          Booked {lastBooking.tickets} {lastBooking.tickets === 1 ? 'ticket' : 'tickets'} for{' '}
          {lastBooking.name} at {lastBooking.templeName} on {formatIstDate(lastBooking.date)},{' '}
          {formatIstTime(lastBooking.startTime)}. Booking ID {lastBooking.id}.
        </p>
      )}
      {templeId ? (
        <SlotList templeId={templeId} date={date} selectedSlotId={slotId} onSelect={setSlotId} />
      ) : (
        <p className="text-slate-600">Choose a temple to see its darshan slots.</p>
      )}
      {selectedSlot && (
        <BookingForm
          key={`${selectedSlot.id}-${String(selectedSlot.remaining)}`}
          slot={selectedSlot}
          onBooked={setLastBooking}
        />
      )}
    </section>
  );
}
