import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useI18n } from '@/i18n/useI18n';
import { makeBookingLookupSchema, type BookingLookupValues } from '../schema';

interface PhoneLookupFormProps {
  /** True while bookings are loading; blocks a second submit. */
  isBusy: boolean;
  onLookup: (phone: string) => void;
}

export function PhoneLookupForm({ isBusy, onLookup }: PhoneLookupFormProps) {
  const { t } = useI18n();
  const schema = useMemo(
    () => makeBookingLookupSchema(t.validation.phoneInvalid),
    [t.validation.phoneInvalid],
  );
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm<BookingLookupValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '' },
  });
  // After a submit, re-validate when the schema (language) changes so an error on screen
  // switches language too; React Hook Form otherwise keeps the old message.
  useEffect(() => {
    if (isSubmitted) void trigger();
  }, [schema, isSubmitted, trigger]);

  const handleValidSubmit = ({ phone }: BookingLookupValues) => {
    onLookup(phone);
  };

  return (
    <form
      noValidate
      aria-label={t.myBookings.lookupForm}
      onSubmit={(event) => void handleSubmit(handleValidSubmit)(event)}
      className="flex flex-col gap-4 sm:flex-row sm:items-start"
    >
      <Input
        label={t.myBookings.phone}
        type="tel"
        aria-required
        inputMode="numeric"
        autoComplete="tel-national"
        hint={t.myBookings.phoneHint}
        error={errors.phone?.message}
        className="w-full sm:max-w-xs"
        {...register('phone')}
      />
      <Button type="submit" isLoading={isBusy} className="w-full px-6 sm:mt-7 sm:w-auto">
        {t.myBookings.find}
      </Button>
    </form>
  );
}
