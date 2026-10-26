import { getErrorMessage } from '@/api/errors';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Select } from '@/components/Input';
import { Spinner } from '@/components/Spinner';
import { formatIstDate } from '@/lib/datetime';
import { useGetTemplesQuery } from '../bookingApi';

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
      <Select
        label="Temple"
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
      </Select>
      <Select
        label="Date"
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
      </Select>
    </div>
  );
}
