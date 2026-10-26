import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId, useMemo, useRef, useState, type BaseSyntheticEvent } from 'react';
import { useForm } from 'react-hook-form';
import { getErrorMessage, isRetryableError } from '@/api/errors';
import type { Booking, BookingRequest, Slot } from '@/api/types';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Input } from '@/components/Input';
import { SectionHeading } from '@/components/SectionHeading';
import { useI18n } from '@/i18n/useI18n';
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
  const { t } = useI18n();
  const headingId = useId();
  const [createBooking, { isLoading, error, reset: resetMutation }] = useCreateBookingMutation();
  // The limit an unresolved attempt was sent with. After a network error that booking may
  // already exist on the server (and be counted in a refreshed `remaining`), so until the
  // attempt succeeds or is rejected by the server, the form keeps the original limit; otherwise
  // the same-key retry would be blocked and the devotee pushed into a second booking.
  const [pendingAttemptMax, setPendingAttemptMax] = useState<number | null>(null);
  const maxTickets =
    pendingAttemptMax === null ? liveMaxTickets : Math.max(liveMaxTickets, pendingAttemptMax);
  const schema = useMemo(
    () => makeBookingSchema(maxTickets, t.validation),
    [maxTickets, t.validation],
  );
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', tickets: 1 },
  });
  // React Hook Form keeps the messages from the last validation run, so after a language switch
  // (a new schema) re-validate once the form has been submitted, to show errors in the new language.
  useEffect(() => {
    if (isSubmitted) void trigger();
  }, [schema, isSubmitted, trigger]);
  // "Try again" unmounts with the error banner when the retry starts, so focus is moved to the
  // form heading first instead of falling back to the page.
  const headingRef = useRef<HTMLHeadingElement>(null);
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
    setPendingAttemptMax(maxTickets);
    const request: BookingRequest = { slotId: slot.id, ...values, idempotencyKey: attempt.key };
    const result = await createBooking(request);
    if (result.data) {
      attemptRef.current = null;
      setPendingAttemptMax(null);
      reset();
      onBooked(result.data.booking);
    } else if (!isRetryableError(result.error)) {
      // The server rejected it, so nothing was booked: back to the live limit.
      setPendingAttemptMax(null);
    }
    // Otherwise the mutation's `error` state renders the message; the typed values are kept.
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
    return (
      <Banner tone="info">
        <p>{t.bookingForm.slotFull}</p>
      </Banner>
    );
  }

  return (
    <form
      noValidate
      aria-labelledby={headingId}
      onSubmit={(event) => void handleFormSubmit(event)}
      onChange={() => {
        if (error) resetMutation();
      }}
      className="space-y-5"
    >
      <div>
        <SectionHeading id={headingId} ref={headingRef} tabIndex={-1}>
          {t.bookingForm.heading}
        </SectionHeading>
        <p className="mt-1 text-sm text-stone-600">{t.bookingForm.allRequired}</p>
      </div>
      <Input
        label={t.bookingForm.name}
        autoComplete="name"
        aria-required
        error={errors.name?.message}
        {...register('name')}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label={t.bookingForm.phone}
          type="tel"
          aria-required
          inputMode="numeric"
          autoComplete="tel-national"
          hint={t.bookingForm.phoneHint}
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label={t.bookingForm.tickets}
          type="number"
          aria-required
          inputMode="numeric"
          min={1}
          max={maxTickets}
          hint={t.bookingForm.ticketsHint(maxTickets)}
          error={errors.tickets?.message}
          {...register('tickets', { valueAsNumber: true })}
        />
      </div>
      {error && (
        <ErrorMessage
          title={t.bookingForm.failed}
          message={getErrorMessage(error)}
          onRetry={
            isRetryableError(error)
              ? () => {
                  headingRef.current?.focus();
                  void handleFormSubmit();
                }
              : undefined
          }
        />
      )}
      <Button type="submit" isLoading={isBusy} className="w-full px-6 sm:w-auto">
        {isBusy ? t.bookingForm.submitting : t.bookingForm.submit}
      </Button>
    </form>
  );
}
