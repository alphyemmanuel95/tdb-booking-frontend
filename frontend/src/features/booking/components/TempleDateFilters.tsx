import { useId } from 'react';
import { getErrorMessage } from '@/api/errors';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Spinner } from '@/components/Spinner';
import { formatIstDate } from '@/lib/datetime';
import { useGetTemplesQuery } from '../bookingApi';

const selectClass =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm';
const labelClass = 'mb-1 block text-sm font-medium text-slate-800';

interface TempleDateFiltersProps {
  templeId: string;
  date: string;
  dates: string[];
  onTempleChange: (templeId: string) => void;
  onDateChange: (date: string) => void;
}

export function TempleDateFilters({
  templeId,
  date,
  dates,
  onTempleChange,
  onDateChange,
}: TempleDateFiltersProps) {
  const id = useId();
  const { data: temples, error, isLoading, refetch } = useGetTemplesQuery(undefined);

  if (isLoading) return <Spinner label="Loading temples…" />;
  if (error) {
    return (
      <ErrorMessage
        title="Could not load temples"
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }
  if (!temples || temples.length === 0) {
    return <p className="text-slate-600">No temples are open for booking right now.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={`${id}-temple`} className={labelClass}>
          Temple
        </label>
        <select
          id={`${id}-temple`}
          className={selectClass}
          value={templeId}
          onChange={(event) => {
            onTempleChange(event.target.value);
          }}
        >
          <option value="">Select a temple</option>
          {temples.map((temple) => (
            <option key={temple.id} value={temple.id}>
              {temple.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${id}-date`} className={labelClass}>
          Date
        </label>
        <select
          id={`${id}-date`}
          className={selectClass}
          value={date}
          onChange={(event) => {
            onDateChange(event.target.value);
          }}
        >
          {dates.map((dateKey) => (
            <option key={dateKey} value={dateKey}>
              {formatIstDate(dateKey)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
