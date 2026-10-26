import { skipToken } from '@reduxjs/toolkit/query/react';
import { useState, type ReactNode } from 'react';
import { getErrorMessage } from '@/api/errors';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Spinner } from '@/components/Spinner';
import { BookingList } from '@/features/my-bookings/components/BookingList';
import { PhoneLookupForm } from '@/features/my-bookings/components/PhoneLookupForm';
import { useGetBookingsQuery } from '@/features/my-bookings/myBookingsApi';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function MyBookingsPage() {
  useDocumentTitle('My bookings');
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
        title="Could not load bookings"
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  } else if (!currentData) {
    results = <Spinner label="Loading bookings…" />;
  } else if (currentData.length === 0) {
    results = (
      <p role="status" className="text-slate-600">
        No bookings found for this phone number.
      </p>
    );
  } else {
    results = <BookingList bookings={currentData} phone={phone} />;
  }

  return (
    <section aria-labelledby="my-bookings-heading" className="space-y-6">
      <h1 id="my-bookings-heading" className="text-3xl font-bold">
        My bookings
      </h1>
      <p className="text-slate-700">
        Enter the mobile number you booked with to see or cancel your bookings. All times are in
        IST.
      </p>
      <PhoneLookupForm isBusy={isFetching} onLookup={handleLookup} />
      {results}
    </section>
  );
}
