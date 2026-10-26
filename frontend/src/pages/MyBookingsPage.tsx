import { skipToken } from '@reduxjs/toolkit/query/react';
import { useId, useState, type ReactNode } from 'react';
import { getErrorMessage } from '@/api/errors';
import { Banner } from '@/components/Banner';
import { Card } from '@/components/Card';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Icon } from '@/components/Icon';
import { Spinner } from '@/components/Spinner';
import { BookingList } from '@/features/my-bookings/components/BookingList';
import { PhoneLookupForm } from '@/features/my-bookings/components/PhoneLookupForm';
import { useGetBookingsQuery } from '@/features/my-bookings/myBookingsApi';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useI18n } from '@/i18n/useI18n';

export function MyBookingsPage() {
  const { t } = useI18n();
  const headingId = useId();
  useDocumentTitle(t.myBookings.title);
  // Local state, not `?phone=` in the URL: a shared or bookmarked link would expose the number.
  const [phone, setPhone] = useState<string | null>(null);
  const { currentData, error, isFetching, refetch } = useGetBookingsQuery(phone ?? skipToken, {
    // Bookings may have been made since the list was last cached.
    refetchOnMountOrArgChange: true,
  });

  const handleLookup = (value: string) => {
    if (value === phone) void refetch();
    else setPhone(value);
  };

  let results: ReactNode;
  if (phone === null) {
    results = null;
  } else if (error) {
    results = (
      <ErrorMessage
        title={t.myBookings.loadError}
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  } else if (!currentData) {
    results = <Spinner label={t.myBookings.loading} />;
  } else if (currentData.length === 0) {
    results = (
      <Banner role="status" tone="info">
        <p>{t.myBookings.empty}</p>
      </Banner>
    );
  } else {
    results = <BookingList bookings={currentData} phone={phone} />;
  }

  return (
    <section aria-labelledby={headingId} className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-800 to-brand-700 px-5 py-7 text-white shadow-md sm:px-8 sm:py-9">
        <Icon
          name="lamp"
          className="absolute -right-4 -bottom-6 size-36 text-white/10 sm:right-4 sm:size-44"
        />
        <h1 id={headingId} className="relative text-3xl font-bold sm:text-4xl">
          {t.myBookings.title}
        </h1>
        <p className="relative mt-2 max-w-prose text-brand-100 sm:text-lg">{t.myBookings.intro}</p>
      </div>
      <Card>
        <PhoneLookupForm isBusy={isFetching} onLookup={handleLookup} />
      </Card>
      {results}
    </section>
  );
}
