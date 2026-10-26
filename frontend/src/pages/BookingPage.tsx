import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { Booking } from '@/api/types';
import { Banner } from '@/components/Banner';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { SectionHeading } from '@/components/SectionHeading';
import { useGetSlotsQuery, useGetTemplesQuery } from '@/features/booking/bookingApi';
import { BookingForm } from '@/features/booking/components/BookingForm';
import { SlotList } from '@/features/booking/components/SlotList';
import { TempleDateFilters } from '@/features/booking/components/TempleDateFilters';
import { getSlotStatus } from '@/features/booking/slotStatus';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { useI18n } from '@/i18n/useI18n';
import { nextIstDateKeys } from '@/lib/datetime';

const BOOKING_DAYS = 7;
const TEMPLE_PARAM = 'temple';
const DATE_PARAM = 'date';

export function BookingPage() {
  const { t, formatDate, formatTime } = useI18n();
  const headingId = useId();
  useDocumentTitle(t.booking.title);
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
  const confirmationRef = useRef<HTMLParagraphElement>(null);
  // A new selection (including one reached with Back/Forward) clears the chosen slot and message.
  const selectionKey = `${templeId}|${date}`;
  const [previousSelectionKey, setPreviousSelectionKey] = useState(selectionKey);
  if (selectionKey !== previousSelectionKey) {
    setPreviousSelectionKey(selectionKey);
    setSlotId(null);
    setLastBooking(null);
  }

  // After a booking the form is cleared, so move focus to the result: screen readers read it
  // straight away, and the next Tab continues to the slot list to book again.
  useEffect(() => {
    if (lastBooking) confirmationRef.current?.focus();
  }, [lastBooking]);

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
