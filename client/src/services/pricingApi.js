import { baseApi } from './baseApi';

export const pricingApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getPricingRules: b.query({ query: () => '/pricing/rules', providesTags: ['Pricing'] }),
    createPricingRule: b.mutation({ query: (body) => ({ url: '/pricing/rules', method: 'POST', body }), invalidatesTags: ['Pricing'] }),
    updatePricingRule: b.mutation({ query: ({ id, ...body }) => ({ url: `/pricing/rules/${id}`, method: 'PUT', body }), invalidatesTags: ['Pricing'] }),
    deletePricingRule: b.mutation({ query: (id) => ({ url: `/pricing/rules/${id}`, method: 'DELETE' }), invalidatesTags: ['Pricing'] }),
    calculateDelivery: b.mutation({ query: (body) => ({ url: '/pricing/calculate', method: 'POST', body }) }),
    getTimeSlots: b.query({ query: () => '/time-slots', providesTags: ['TimeSlots'] }),
    createTimeSlot: b.mutation({ query: (body) => ({ url: '/time-slots', method: 'POST', body }), invalidatesTags: ['TimeSlots'] }),
    updateTimeSlot: b.mutation({ query: ({ id, ...body }) => ({ url: `/time-slots/${id}`, method: 'PUT', body }), invalidatesTags: ['TimeSlots'] }),
    deleteTimeSlot: b.mutation({ query: (id) => ({ url: `/time-slots/${id}`, method: 'DELETE' }), invalidatesTags: ['TimeSlots'] }),
  }),
  overrideExisting: false,
});

export const {
  useGetPricingRulesQuery, useCreatePricingRuleMutation, useUpdatePricingRuleMutation,
  useDeletePricingRuleMutation, useCalculateDeliveryMutation,
  useGetTimeSlotsQuery, useCreateTimeSlotMutation, useUpdateTimeSlotMutation, useDeleteTimeSlotMutation,
} = pricingApi;
