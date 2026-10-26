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
      // Released tickets change slot counts, and after a network error the cancel may still have
      // reached the server, so slot counts are refreshed either way. The booking list is patched
      // below instead of refetched, so a randomly failing refetch cannot hide a cancellation.
      invalidatesTags: ['Slots'],
      async onQueryStarted({ bookingId, phone }, { dispatch, queryFulfilled }) {
        // Optimistic: show the booking as cancelled straight away.
        const patch = dispatch(
          myBookingsApi.util.updateQueryData('getBookings', phone, (bookings) => {
            const cached = bookings.find((booking) => booking.id === bookingId);
            if (cached) cached.status = 'cancelled';
          }),
        );
        try {
          const { data } = await queryFulfilled;
          // Write the server's answer back, in case a list refetch that started before the
          // cancel reached the server replaced the optimistic patch with the old status.
          dispatch(
            myBookingsApi.util.updateQueryData('getBookings', phone, (bookings) => {
              const index = bookings.findIndex((booking) => booking.id === data.id);
              if (index !== -1) bookings[index] = data;
            }),
          );
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
