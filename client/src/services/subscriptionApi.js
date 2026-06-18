import { baseApi } from './baseApi';

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    createSubscription: b.mutation({ query: (body) => ({ url: '/subscriptions', method: 'POST', body }), invalidatesTags: ['Subscriptions'] }),
    getMySubscriptions: b.query({ query: () => '/subscriptions/my', providesTags: ['Subscriptions'] }),
    getAllSubscriptions: b.query({ query: (p = {}) => ({ url: '/subscriptions', params: p }), providesTags: ['Subscriptions'] }),
    pauseSubscription: b.mutation({ query: ({ id, ...body }) => ({ url: `/subscriptions/${id}/pause`, method: 'PATCH', body }), invalidatesTags: ['Subscriptions'] }),
    resumeSubscription: b.mutation({ query: (id) => ({ url: `/subscriptions/${id}/resume`, method: 'PATCH' }), invalidatesTags: ['Subscriptions'] }),
    skipDelivery: b.mutation({ query: ({ id, ...body }) => ({ url: `/subscriptions/${id}/skip`, method: 'PATCH', body }), invalidatesTags: ['Subscriptions'] }),
    processDueSubscriptions: b.mutation({ query: () => ({ url: '/subscriptions/process-due', method: 'POST' }), invalidatesTags: ['Subscriptions', 'Orders'] }),
    cancelSubscription: b.mutation({ query: (id) => ({ url: `/subscriptions/${id}`, method: 'PATCH', body: { status: 'cancelled' } }), invalidatesTags: ['Subscriptions'] }),
    updateSubscription: b.mutation({ query: ({ id, ...body }) => ({ url: `/subscriptions/${id}`, method: 'PATCH', body }), invalidatesTags: ['Subscriptions'] }),
  }),
  overrideExisting: false,
});

export const {
  useCreateSubscriptionMutation, useGetMySubscriptionsQuery, useGetAllSubscriptionsQuery,
  usePauseSubscriptionMutation, useResumeSubscriptionMutation, useSkipDeliveryMutation,
  useProcessDueSubscriptionsMutation, useCancelSubscriptionMutation, useUpdateSubscriptionMutation,
} = subscriptionApi;
