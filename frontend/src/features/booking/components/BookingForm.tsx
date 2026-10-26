import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef, useState, type BaseSyntheticEvent } from 'react';
import { useForm } from 'react-hook-form';
import { getErrorMessage, isRetryableError } from '@/api/errors';
import type { Booking, BookingRequest, Slot } from '@/api/types';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Input } from '@/components/Input';
import { useCreateBookingMutation } from '../bookingApi';
import { MAX_TICKETS_PER_BOOKING, makeBookingSchema, type BookingFormValues } from '../schema';

interface BookingFormProps {
  /** A bookable slot. Render with `key={slot.id}` so switching slots starts a fresh form. */
  slot: Slot;
  onBooked: (booking: Booking) => void;
}

/** The idempotency key of the current booking attempt and the details it was sent with. */
interface BookingAttempt {
  key: string;
  details: string;
}

export function BookingForm({ slot, onBooked }: BookingFormProps) {
  const liveMaxTickets = Math.min(slot.remaining, MAX_TICKETS_PER_BOOKING);
  const [createBooking, { isLoading, error, reset: resetMutation }] = useCreateBookingMutation();
  // The limit when the last attempt was sent. After a network error that booking may already
  // exist on the server (and be counted in a refreshed `remaining`), so the retry is validated
  // against the original limit; otherwise the same-key retry would be blocked and the devotee
  // pushed into a second booking. Editing the form clears the error and restores the live limit.
  const [attemptMaxTickets, setAttemptMaxTickets] = useState(liveMaxTickets);
  const maxTickets = isRetryableError(error)
    ? Math.max(liveMaxTickets, attemptMaxTickets)
    : liveMaxTickets;
  const schema = useMemo(() => makeBookingSchema(maxTickets), [maxTickets]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', tickets: 1 },
  });
  // Set synchronously, so a second click or Enter before React re-renders the disabled
  // button cannot start another submit.
  const isSubmittingRef = useRef(false);
  // Kept after a failure so retrying the same details reuses the key and cannot book twice
  // if the failed request did reach the server. Edited details get a new key.
  const attemptRef = useRef<BookingAttempt | null>(null);
  const isBusy = isSubmitting || isLoading;

  const handleValidSubmit = async (values: BookingFormValues) => {
    const details = JSON.stringify([slot.id, values.name, values.phone, values.tickets]);
    const attempt =
      attemptRef.current?.details === details
        ? attemptRef.current
        : { key: crypto.randomUUID(), details };
    attemptRef.current = attempt;
    setAttemptMaxTickets(maxTickets);
    const request: BookingRequest = { slotId: slot.id, ...values, idempotencyKey: attempt.key };
    try {
      const { booking } = await createBooking(request).unwrap();
      attemptRef.current = null;
      reset();
      onBooked(booking);
    } catch {
      // The mutation's `error` state renders the message below; the typed values are kept.
    }
  };

  const handleFormSubmit = async (event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      await handleSubmit(handleValidSubmit)(event);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  if (maxTickets === 0) {
    return <p className="text-slate-700">This slot is now full. Choose another slot.</p>;
  }

  return (
    <form
      noValidate
      aria-labelledby="booking-form-heading"
      onSubmit={(event) => void handleFormSubmit(event)}
      onChange={() => {
        if (error) resetMutation();
      }}
      className="space-y-4"
    >
      <h2 id="booking-form-heading" className="text-lg font-semibold">
        Devotee details
      </h2>
      <p className="text-sm text-slate-600">All fields are required.</p>
      <Input
        label="Name"
        autoComplete="name"
        aria-required
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Phone number"
        type="tel"
        aria-required
        inputMode="numeric"
        autoComplete="tel-national"
        hint="10-digit mobile number"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <Input
        label="Number of tickets"
        type="number"
        aria-required
        inputMode="numeric"
        min={1}
        max={maxTickets}
        hint={`Up to ${String(maxTickets)} tickets`}
        error={errors.tickets?.message}
        {...register('tickets', { valueAsNumber: true })}
      />
      {error && (
        <ErrorMessage
          title="Booking failed"
          message={getErrorMessage(error)}
          onRetry={isRetryableError(error) ? () => void handleFormSubmit() : undefined}
        />
      )}
      <Button type="submit" isLoading={isBusy}>
        {isBusy ? 'Booking…' : 'Book tickets'}
      </Button>
    </form>
  );
}
