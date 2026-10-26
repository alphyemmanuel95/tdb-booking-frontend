import { getErrorMessage } from '@/api/errors';
import type { Slot } from '@/api/types';
import { ErrorMessage } from '@/components/ErrorMessage';
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

  if (!currentData && isFetching) return <Spinner label={t.slots.loading} />;
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
    return <p className="text-slate-600">{t.slots.empty}</p>;
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-800">{t.slots.legend}</legend>
      <ul className="grid gap-2 sm:grid-cols-2">
        {currentData.map((slot) => {
          const status = getSlotStatus(slot, now);
          const bookable = status === 'available';
          return (
            <li key={slot.id}>
              <label
                className={`flex flex-wrap items-center gap-x-3 rounded-md border p-3 ${
                  bookable
                    ? 'cursor-pointer border-slate-300 bg-white has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50'
                    : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-600'
                }`}
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
                />
                {/* The space keeps the radio's name readable: "9:00 am 10 of 20 tickets…". */}
                <span className="font-medium">{formatTime(slot.startTime)}</span>{' '}
                <span className="text-sm">{describeSlotStatus(slot, status, t.slots)}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
