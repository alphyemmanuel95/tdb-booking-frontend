import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { getErrorMessage } from '@/api/errors';
import type { Booking, Slot } from '@/api/types';
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

export function BookingForm({ slot, onBooked }: BookingFormProps) {
  const maxTickets = Math.min(slot.remaining, MAX_TICKETS_PER_BOOKING);
  const schema = useMemo(() => makeBookingSchema(maxTickets), [maxTickets]);
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
      aria-labelledby="booking-form-heading"
      onSubmit={(event) => void handleSubmit(handleValidSubmit)(event)}
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
      {error && <ErrorMessage title="Booking failed" message={getErrorMessage(error)} />}
      <Button type="submit" isLoading={isLoading}>
        {isLoading ? 'Booking…' : 'Book tickets'}
      </Button>
    </form>
  );
}
