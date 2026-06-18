import { baseApi } from './baseApi';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    createOrder: b.mutation({ query: (body) => ({ url: '/orders', method: 'POST', body }), invalidatesTags: ['Orders', 'Reports'] }),
    getMyOrders: b.query({ query: (p = {}) => ({ url: '/orders/my', params: p }), providesTags: ['Orders'] }),
    getAllOrders: b.query({ query: (p = {}) => ({ url: '/orders', params: p }), providesTags: ['Orders'] }),
    getOrder: b.query({ query: (id) => `/orders/${id}`, providesTags: ['Orders'] }),
    updateOrderStatus: b.mutation({ query: ({ id, ...body }) => ({ url: `/orders/${id}/status`, method: 'PATCH', body }), invalidatesTags: ['Orders', 'Reports', 'Notifications'] }),
    updatePaymentStatus: b.mutation({ query: ({ id, ...body }) => ({ url: `/orders/${id}/payment-status`, method: 'PATCH', body }), invalidatesTags: ['Orders', 'Reports'] }),
    reorder: b.mutation({ query: (id) => ({ url: `/orders/${id}/reorder`, method: 'POST' }), invalidatesTags: ['Orders'] }),
  }),
  overrideExisting: false,
});

export const {
  useCreateOrderMutation, useGetMyOrdersQuery, useGetAllOrdersQuery,
  useGetOrderQuery, useUpdateOrderStatusMutation, useUpdatePaymentStatusMutation, useReorderMutation,
} = orderApi;
