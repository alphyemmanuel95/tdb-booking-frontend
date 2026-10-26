import { getErrorMessage } from '@/api/errors';
import type { Slot } from '@/api/types';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Spinner } from '@/components/Spinner';
import { useNow } from '@/hooks/useNow';
import { formatIstTime } from '@/lib/datetime';
import { useGetSlotsQuery } from '../bookingApi';
import { getSlotStatus, type SlotStatus } from '../slotStatus';

interface SlotListProps {
  templeId: string;
  date: string;
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
}

function describeSlotStatus(slot: Slot, status: SlotStatus): string {
  switch (status) {
    case 'available':
      return `${String(slot.remaining)} of ${String(slot.capacity)} tickets remaining`;
    case 'full':
      return 'Full, no tickets left';
    case 'started':
      return 'Already started, booking closed';
  }
}

export function SlotList({ templeId, date, selectedSlotId, onSelect }: SlotListProps) {
  // `currentData` is only ever the result for these exact args, never a previous selection's.
  const { currentData, error, isFetching, refetch } = useGetSlotsQuery({ templeId, date });
  const now = useNow();

  if (!currentData && isFetching) return <Spinner label="Loading slots…" />;
  if (error) {
    return (
      <ErrorMessage
        title="Could not load slots"
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }
  if (!currentData || currentData.length === 0) {
    return <p className="text-slate-600">No darshan slots on this day. Try another date.</p>;
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-800">Choose a slot</legend>
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
                <span className="font-medium">{formatIstTime(slot.startTime)}</span>
                <span className="text-sm">{describeSlotStatus(slot, status)}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
