import { baseApi } from './baseApi';

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    submitPaymentProof: b.mutation({ query: (body) => ({ url: '/payments/proof', method: 'POST', body }), invalidatesTags: ['Payments'] }),
    getMyPayments: b.query({ query: () => '/payments/my', providesTags: ['Payments'] }),
    getAllPayments: b.query({ query: (p = {}) => ({ url: '/payments', params: p }), providesTags: ['Payments'] }),
    approvePayment: b.mutation({
      query: (arg) => {
        const { id, ...body } = typeof arg === 'object' ? arg : { id: arg };
        return { url: `/payments/${id}/approve`, method: 'PATCH', body };
      },
      invalidatesTags: ['Payments', 'Bills', 'Reports', 'Notifications', 'Orders'],
    }),
    rejectPayment: b.mutation({ query: ({ id, ...body }) => ({ url: `/payments/${id}/reject`, method: 'PATCH', body }), invalidatesTags: ['Payments', 'Notifications'] }),
    partialPayment: b.mutation({ query: ({ id, ...body }) => ({ url: `/payments/${id}/partial`, method: 'PATCH', body }), invalidatesTags: ['Payments', 'Bills', 'Orders'] }),
    markCashReceived: b.mutation({ query: (orderId) => ({ url: `/payments/order/${orderId}/cash-received`, method: 'PATCH' }), invalidatesTags: ['Payments', 'Orders', 'Reports'] }),
  }),
  overrideExisting: false,
});

export const {
  useSubmitPaymentProofMutation, useGetMyPaymentsQuery, useGetAllPaymentsQuery,
  useApprovePaymentMutation, useRejectPaymentMutation, usePartialPaymentMutation, useMarkCashReceivedMutation,
} = paymentApi;
