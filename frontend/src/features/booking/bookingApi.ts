import { baseApi } from '@/api/baseApi';
import { toQueryResult } from '@/api/errors';
import * as mockApi from '@/api/mockApi';
import type { BookingRequest, BookingResult, Slot, Temple } from '@/api/types';

export interface SlotsArgs {
  templeId: string;
  date: string;
}

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTemples: build.query<Temple[], undefined>({
      queryFn: () => toQueryResult(() => mockApi.getTemples()),
    }),
    getSlots: build.query<Slot[], SlotsArgs>({
      queryFn: ({ templeId, date }) => toQueryResult(() => mockApi.getSlots(templeId, date)),
      providesTags: ['Slots'],
    }),
    createBooking: build.mutation<BookingResult, BookingRequest>({
      queryFn: (request) => toQueryResult(() => mockApi.createBooking(request)),
      // Update the cached slot from the server's answer instead of refetching,
      // so the new remaining count shows even if a refetch would randomly fail.
      async onQueryStarted(_request, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { slot } = data;
          dispatch(
            bookingApi.util.updateQueryData(
              'getSlots',
              { templeId: slot.templeId, date: slot.date },
              (slots) => {
                const cached = slots.find((candidate) => candidate.id === slot.id);
                if (cached) cached.remaining = slot.remaining;
              },
            ),
          );
        } catch {
          // The mutation's own `error` state shows the failure.
        }
      },
    }),
  }),
});

export const { useGetTemplesQuery, useGetSlotsQuery, useCreateBookingMutation } = bookingApi;
