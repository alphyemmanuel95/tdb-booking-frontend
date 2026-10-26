import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { bookingLookupSchema, type BookingLookupValues } from '../schema';

interface PhoneLookupFormProps {
  /** True while bookings are loading; blocks a second submit. */
  isBusy: boolean;
  onLookup: (phone: string) => void;
}

export function PhoneLookupForm({ isBusy, onLookup }: PhoneLookupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingLookupValues>({
    resolver: zodResolver(bookingLookupSchema),
    defaultValues: { phone: '' },
  });

  const handleValidSubmit = ({ phone }: BookingLookupValues) => {
    onLookup(phone);
  };

  return (
    <form
      noValidate
      aria-label="Find your bookings"
      onSubmit={(event) => void handleSubmit(handleValidSubmit)(event)}
      className="space-y-4"
    >
      <Input
        label="Phone number"
        type="tel"
        aria-required
        inputMode="numeric"
        autoComplete="tel-national"
        hint="The 10-digit mobile number you booked with"
        error={errors.phone?.message}
        className="max-w-xs"
        {...register('phone')}
      />
      <Button type="submit" isLoading={isBusy}>
        Find bookings
      </Button>
    </form>
  );
}
