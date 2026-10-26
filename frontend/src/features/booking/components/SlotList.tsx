import { getErrorMessage } from '@/api/errors';
import type { Slot } from '@/api/types';
import { Banner } from '@/components/Banner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Icon } from '@/components/Icon';
import { Spinner } from '@/components/Spinner';
import { useNow } from '@/hooks/useNow';
import type { Messages } from '@/i18n/en';
import { useI18n } from '@/i18n/useI18n';
import { useGetSlotsQuery } from '../bookingApi';
import { getSlotStatus, type SlotStatus } from '../slotStatus';

interface SlotListProps {
  templeId: string;
  date: string;
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
}

const cardClasses: Record<SlotStatus, string> = {
  available:
    'cursor-pointer border-stone-300 bg-white hover:border-brand-700 hover:bg-cream-50 has-checked:border-brand-700 has-checked:bg-brand-50 has-checked:ring-2 has-checked:ring-brand-700',
  full: 'cursor-not-allowed border-dashed border-stone-300 bg-stone-100 text-stone-600',
  started: 'cursor-not-allowed border-dashed border-stone-300 bg-stone-100 text-stone-600',
};

const pillClasses: Record<SlotStatus, string> = {
  available: 'bg-green-50 text-green-800 ring-green-200',
  full: 'bg-red-50 text-red-800 ring-red-200',
  started: 'bg-stone-200 text-stone-700 ring-stone-300',
};

function describeSlotStatus(slot: Slot, status: SlotStatus, t: Messages['slots']): string {
  switch (status) {
    case 'available':
      return t.remaining(slot.remaining, slot.capacity);
    case 'full':
      return t.full;
    case 'started':
      return t.started;
  }
}

export function SlotList({ templeId, date, selectedSlotId, onSelect }: SlotListProps) {
  // `currentData` is only ever the result for these exact args, never a previous selection's.
  const { currentData, error, isFetching, refetch } = useGetSlotsQuery({ templeId, date });
  const now = useNow();
  const { t, formatTime } = useI18n();

  if (!currentData && isFetching) {
    return (
      <div>
        <Spinner label={t.slots.loading} />
        {/* Placeholder cards hint at the layout while slots load. */}
        <div aria-hidden="true" className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl bg-stone-100 motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <ErrorMessage
        title={t.slots.error}
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }
  if (!currentData || currentData.length === 0) {
    return (
      <Banner tone="info">
        <p>{t.slots.empty}</p>
      </Banner>
    );
  }

  return (
    <fieldset>
      {/* The card heading shows this text, so the group name stays for screen readers only. */}
      <legend className="sr-only">{t.slots.legend}</legend>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {currentData.map((slot) => {
          const status = getSlotStatus(slot, now);
          const bookable = status === 'available';
          return (
            <li key={slot.id}>
              <label
                className={`group flex h-full items-start gap-3 rounded-xl border p-4 transition-colors motion-reduce:transition-none ${cardClasses[status]}`}
              >
                <input
                  type="radio"
                  name="slot"
                  value={slot.id}
                  checked={selectedSlotId === slot.id}
                  disabled={!bookable}
                  onChange={() => {
                    onSelect(slot.id);
                  }}
                  className="mt-1.5 size-5 shrink-0 accent-brand-700"
                />
                <span className="flex min-w-0 flex-1 flex-col items-start gap-2">
                  {/* The space keeps the radio's name readable: "9:00 am 10 of 20 tickets…". */}
                  <span
                    className={`text-xl font-bold ${bookable ? 'text-stone-900' : 'text-stone-600'}`}
                  >
                    {formatTime(slot.startTime)}
                  </span>{' '}
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${pillClasses[status]}`}
                  >
                    {describeSlotStatus(slot, status, t.slots)}
                  </span>
                </span>
                <Icon
                  name="checkCircle"
                  className="hidden size-6 shrink-0 text-brand-700 group-has-checked:block"
                />
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
