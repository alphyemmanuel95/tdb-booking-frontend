import { baseApi } from '@/api/baseApi';
import { toQueryResult } from '@/api/errors';
import * as mockApi from '@/api/mockApi';
import type { Booking } from '@/api/types';

export interface CancelBookingArgs {
  bookingId: string;
  /** The phone the list was looked up with, i.e. the `getBookings` cache key to patch. */
  phone: string;
}

export const myBookingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBookings: build.query<Booking[], string>({
      queryFn: (phone) => toQueryResult(() => mockApi.getBookings(phone)),
      providesTags: ['Bookings'],
    }),
    cancelBooking: build.mutation<Booking, CancelBookingArgs>({
      queryFn: ({ bookingId }) => toQueryResult(() => mockApi.cancelBooking(bookingId)),
      // Released tickets change slot counts. The booking list is patched below instead of
      // refetched, so a randomly failing refetch cannot hide a cancellation that succeeded.
      invalidatesTags: (_result, error) => (error ? [] : ['Slots']),
      async onQueryStarted({ bookingId, phone }, { dispatch, queryFulfilled }) {
        // Optimistic: show the booking as cancelled straight away.
        const patch = dispatch(
          myBookingsApi.util.updateQueryData('getBookings', phone, (bookings) => {
            const cached = bookings.find((booking) => booking.id === bookingId);
            if (cached) cached.status = 'cancelled';
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          // The server refused or the network failed: restore the previous state.
          // The mutation's own `error` state shows the message.
          patch.undo();
        }
      },
    }),
  }),
});

export const { useGetBookingsQuery, useCancelBookingMutation } = myBookingsApi;
