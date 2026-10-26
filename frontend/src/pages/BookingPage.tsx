import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { Booking } from '@/api/types';
import { useGetSlotsQuery, useGetTemplesQuery } from '@/features/booking/bookingApi';
import { BookingForm } from '@/features/booking/components/BookingForm';
import { SlotList } from '@/features/booking/components/SlotList';
import { TempleDateFilters } from '@/features/booking/components/TempleDateFilters';
import { getSlotStatus } from '@/features/booking/slotStatus';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { formatIstDate, formatIstTime, nextIstDateKeys } from '@/lib/datetime';

const BOOKING_DAYS = 7;
const TEMPLE_PARAM = 'temple';
const DATE_PARAM = 'date';

export function BookingPage() {
  useDocumentTitle('Book darshan');
  const dates = useMemo(() => nextIstDateKeys(BOOKING_DAYS), []);
  // Temple and date live in the URL so they survive a refresh, can be shared and work with Back.
  // Unknown or out-of-range values fall back to "no temple" and today rather than failing.
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: temples } = useGetTemplesQuery(undefined);
  const templeParam = searchParams.get(TEMPLE_PARAM) ?? '';
  const templeId = temples?.some((temple) => temple.id === templeParam) ? templeParam : '';
  const dateParam = searchParams.get(DATE_PARAM) ?? '';
  const date = dates.includes(dateParam) ? dateParam : (dates[0] ?? '');

  const [slotId, setSlotId] = useState<string | null>(null);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  // A new selection (including one reached with Back/Forward) clears the chosen slot and message.
  const selectionKey = `${templeId}|${date}`;
  const [previousSelectionKey, setPreviousSelectionKey] = useState(selectionKey);
  if (selectionKey !== previousSelectionKey) {
    setPreviousSelectionKey(selectionKey);
    setSlotId(null);
    setLastBooking(null);
  }

  const now = useNow();
  const { currentData: slots } = useGetSlotsQuery({ templeId, date }, { skip: !templeId });
  const selectedSlot = slots?.find(
    // A slot that fills up while selected keeps its form, so a retry after a lost response
    // (which may itself have taken the last tickets) is still possible.
    (slot) => slot.id === slotId && getSlotStatus(slot, now) !== 'started',
  );

  // Each change pushes a history entry so Back returns to the previous selection.
  const changeSelection = (next: { templeId?: string; date?: string }) => {
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous);
      const nextTempleId = next.templeId ?? templeId;
      if (nextTempleId) params.set(TEMPLE_PARAM, nextTempleId);
      else params.delete(TEMPLE_PARAM);
      params.set(DATE_PARAM, next.date ?? date);
      return params;
    });
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
      {/* Always rendered so screen readers announce the message when it is added. */}
      <div role="status">
        {lastBooking && (
          <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            Booked {lastBooking.tickets} {lastBooking.tickets === 1 ? 'ticket' : 'tickets'} for{' '}
            {lastBooking.name} at {lastBooking.templeName} on {formatIstDate(lastBooking.date)},{' '}
            {formatIstTime(lastBooking.startTime)}. Booking ID {lastBooking.id}.
          </p>
        )}
      </div>
      {templeId ? (
        <SlotList templeId={templeId} date={date} selectedSlotId={slotId} onSelect={setSlotId} />
      ) : (
        <p className="text-slate-600">Choose a temple to see its darshan slots.</p>
      )}
      {selectedSlot && (
        <BookingForm key={selectedSlot.id} slot={selectedSlot} onBooked={setLastBooking} />
      )}
    </section>
  );
}
