import { baseApi } from './baseApi';

export const billingApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    generateBill: b.mutation({ query: (body) => ({ url: '/bills/generate', method: 'POST', body }), invalidatesTags: ['Bills'] }),
    getMyBills: b.query({ query: () => '/bills/my', providesTags: ['Bills'] }),
    getAllBills: b.query({ query: (p = {}) => ({ url: '/bills', params: p }), providesTags: ['Bills'] }),
    getBill: b.query({ query: (id) => `/bills/${id}`, providesTags: ['Bills'] }),
    markBillPaid: b.mutation({ query: (id) => ({ url: `/bills/${id}/mark-paid`, method: 'PATCH' }), invalidatesTags: ['Bills', 'Reports'] }),
  }),
  overrideExisting: false,
});

export const {
  useGenerateBillMutation, useGetMyBillsQuery, useGetAllBillsQuery, useGetBillQuery, useMarkBillPaidMutation,
} = billingApi;
