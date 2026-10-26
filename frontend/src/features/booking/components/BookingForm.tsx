import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { getErrorMessage } from '@/api/errors';
import type { Booking, Slot } from '@/api/types';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Input } from '@/components/Input';
import { useI18n } from '@/i18n/useI18n';
import { useCreateBookingMutation } from '../bookingApi';
import { MAX_TICKETS_PER_BOOKING, makeBookingSchema, type BookingFormValues } from '../schema';

interface BookingFormProps {
  /** A bookable slot. Render with `key={slot.id}` so switching slots starts a fresh form. */
  slot: Slot;
  onBooked: (booking: Booking) => void;
}

export function BookingForm({ slot, onBooked }: BookingFormProps) {
  const maxTickets = Math.min(slot.remaining, MAX_TICKETS_PER_BOOKING);
  const { t } = useI18n();
  const headingId = useId();
  const schema = useMemo(
    () => makeBookingSchema(maxTickets, t.validation),
    [maxTickets, t.validation],
  );
  const [createBooking, { isLoading, error, reset: resetMutation }] = useCreateBookingMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', tickets: 1 },
  });

  const handleValidSubmit = async (values: BookingFormValues) => {
    try {
      const { booking } = await createBooking({ slotId: slot.id, ...values }).unwrap();
      reset();
      onBooked(booking);
    } catch {
      // The mutation's `error` state renders the message below; the typed values are kept.
    }
  };

  return (
    <form
      noValidate
      aria-labelledby={headingId}
      onSubmit={(event) => void handleSubmit(handleValidSubmit)(event)}
      onChange={() => {
        if (error) resetMutation();
      }}
      className="space-y-4"
    >
      <h2 id={headingId} className="text-lg font-semibold">
        {t.bookingForm.heading}
      </h2>
      <p className="text-sm text-slate-600">{t.bookingForm.allRequired}</p>
      <Input
        label={t.bookingForm.name}
        autoComplete="name"
        aria-required
        error={errors.name?.message}
        {...register('name')}
      />
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
      {error && <ErrorMessage title={t.bookingForm.failed} message={getErrorMessage(error)} />}
      <Button type="submit" isLoading={isLoading}>
        {isLoading ? t.bookingForm.submitting : t.bookingForm.submit}
      </Button>
    </form>
  );
}
