import { getErrorMessage } from '@/api/errors';
import { Banner } from '@/components/Banner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Select } from '@/components/Input';
import { Spinner } from '@/components/Spinner';
import { useI18n } from '@/i18n/useI18n';
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
  const { t, formatDate } = useI18n();

  if (isLoading) return <Spinner label={t.filters.loadingTemples} />;
  if (error) {
    return (
      <ErrorMessage
        title={t.filters.templesError}
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }
  if (!temples || temples.length === 0) {
    return (
      <Banner tone="info">
        <p>{t.filters.noTemples}</p>
      </Banner>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        label={t.filters.temple}
        value={templeId}
        onChange={(event) => {
          onTempleChange(event.target.value);
        }}
      >
        <option value="">{t.filters.selectTemple}</option>
        {temples.map((temple) => (
          <option key={temple.id} value={temple.id}>
            {temple.name}
          </option>
        ))}
      </Select>
      <Select
        label={t.filters.date}
        value={date}
        onChange={(event) => {
          onDateChange(event.target.value);
        }}
      >
        {dates.map((dateKey) => (
          <option key={dateKey} value={dateKey}>
            {formatDate(dateKey)}
          </option>
        ))}
      </Select>
    </div>
  );
}
