import { baseApi } from '@/api/baseApi';
import type { FeedbackInput } from './schema';
import type { Feedback } from './types';

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFeedback: build.query<Feedback[], undefined>({
      query: () => '/feedback',
      providesTags: ['Feedback'],
    }),
    createFeedback: build.mutation<Feedback, FeedbackInput>({
      query: (body) => ({ url: '/feedback', method: 'POST', body }),
      invalidatesTags: ['Feedback'],
    }),
  }),
});

export const { useGetFeedbackQuery, useCreateFeedbackMutation } = feedbackApi;
