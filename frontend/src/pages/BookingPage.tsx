import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Booking } from '@/api/types';
import { Banner } from '@/components/Banner';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { SectionHeading } from '@/components/SectionHeading';
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
    <section aria-labelledby={headingId}>
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-800 to-brand-700 px-5 py-7 text-white shadow-md sm:px-8 sm:py-9">
        <Icon
          name="lamp"
          className="absolute -right-4 -bottom-6 size-36 text-white/10 sm:right-4 sm:size-44"
        />
        <h1 id={headingId} className="relative text-3xl font-bold sm:text-4xl">
          {t.booking.title}
        </h1>
        <p className="relative mt-2 max-w-prose text-brand-100 sm:text-lg">{t.booking.intro}</p>
      </div>
      <Card step={1} className="mt-10">
        <SectionHeading className="mb-4">{t.booking.templeDateHeading}</SectionHeading>
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
      </Card>
      {/* Always rendered so screen readers announce the message when it is added. */}
      <div role="status">
        {lastBooking && (
          <Banner tone="success" className="mt-6">
            <p ref={confirmationRef} tabIndex={-1} className="rounded-sm">
              {t.booking.confirmation({
                tickets: lastBooking.tickets,
                name: lastBooking.name,
                templeName: lastBooking.templeName,
                date: formatDate(lastBooking.date),
                time: formatTime(lastBooking.startTime),
                bookingId: lastBooking.id,
              })}
            </p>
          </Banner>
        )}
      </div>
      <Card step={2} className="mt-10">
        <SectionHeading className="mb-4">{t.slots.legend}</SectionHeading>
        {templeId ? (
          <SlotList templeId={templeId} date={date} selectedSlotId={slotId} onSelect={setSlotId} />
        ) : (
          <Banner tone="info">
            <p>{t.booking.chooseTemplePrompt}</p>
          </Banner>
        )}
      </Card>
      {selectedSlot && (
        <Card step={3} className="mt-10">
          <BookingForm key={selectedSlot.id} slot={selectedSlot} onBooked={setLastBooking} />
        </Card>
      )}
    </section>
  );
}
