import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Booking } from '@/api/types';
import { useGetSlotsQuery } from '@/features/booking/bookingApi';
import { BookingForm } from '@/features/booking/components/BookingForm';
import { SlotList } from '@/features/booking/components/SlotList';
import { TempleDateFilters } from '@/features/booking/components/TempleDateFilters';
import { getSlotStatus } from '@/features/booking/slotStatus';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { useI18n } from '@/i18n/useI18n';
import { nextIstDateKeys } from '@/lib/datetime';

const BOOKING_DAYS = 7;

export function BookingPage() {
  const { t, formatDate, formatTime } = useI18n();
  const headingId = useId();
  useDocumentTitle(t.booking.title);
  const dates = useMemo(() => nextIstDateKeys(BOOKING_DAYS), []);
  const [templeId, setTempleId] = useState('');
  const [date, setDate] = useState(dates[0] ?? '');
  const [slotId, setSlotId] = useState<string | null>(null);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  const confirmationRef = useRef<HTMLParagraphElement>(null);

  // After a booking the form is cleared, so move focus to the result: screen readers read it
  // straight away, and the next Tab continues to the slot list to book again.
  useEffect(() => {
    if (lastBooking) confirmationRef.current?.focus();
  }, [lastBooking]);

  const now = useNow();
  const { currentData: slots } = useGetSlotsQuery({ templeId, date }, { skip: !templeId });
  const selectedSlot = slots?.find(
    (slot) => slot.id === slotId && getSlotStatus(slot, now) === 'available',
  );

  const changeSelection = (next: { templeId?: string; date?: string }) => {
    setTempleId(next.templeId ?? templeId);
    setDate(next.date ?? date);
    setSlotId(null);
    setLastBooking(null);
  };

  return (
    <section aria-labelledby={headingId} className="space-y-6">
      <h1 id={headingId} className="text-3xl font-bold">
        {t.booking.title}
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
          <p
            ref={confirmationRef}
            tabIndex={-1}
            className="rounded-md bg-green-50 p-3 text-sm text-green-800"
          >
            {t.booking.confirmation({
              tickets: lastBooking.tickets,
              name: lastBooking.name,
              templeName: lastBooking.templeName,
              date: formatDate(lastBooking.date),
              time: formatTime(lastBooking.startTime),
              bookingId: lastBooking.id,
            })}
          </p>
        )}
      </div>
      {templeId ? (
        <SlotList templeId={templeId} date={date} selectedSlotId={slotId} onSelect={setSlotId} />
      ) : (
        <p className="text-slate-600">{t.booking.chooseTemplePrompt}</p>
      )}
      {selectedSlot && (
        <BookingForm key={selectedSlot.id} slot={selectedSlot} onBooked={setLastBooking} />
      )}
    </section>
  );
}
