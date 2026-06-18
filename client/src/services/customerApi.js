import { baseApi } from './baseApi';

export const customerApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getAllCustomers: b.query({ query: (p = {}) => ({ url: '/customers', params: p }), providesTags: ['Customers'] }),
    getCustomer: b.query({ query: (id) => `/customers/${id}`, providesTags: ['Customers'] }),
    toggleCustomer: b.mutation({ query: (id) => ({ url: `/customers/${id}/toggle`, method: 'PATCH' }), invalidatesTags: ['Customers'] }),
    togglePayLater: b.mutation({ query: ({ id, allowPayLater }) => ({ url: `/customers/${id}/pay-later`, method: 'PATCH', body: { allowPayLater } }), invalidatesTags: ['Customers'] }),
    getAddresses: b.query({ query: () => '/customers/addresses', providesTags: ['Customers'] }),
    addAddress: b.mutation({ query: (body) => ({ url: '/customers/addresses', method: 'POST', body }), invalidatesTags: ['Customers'] }),
    updateAddress: b.mutation({ query: ({ id, ...body }) => ({ url: `/customers/addresses/${id}`, method: 'PUT', body }), invalidatesTags: ['Customers'] }),
    deleteAddress: b.mutation({ query: (id) => ({ url: `/customers/addresses/${id}`, method: 'DELETE' }), invalidatesTags: ['Customers'] }),
    checkServiceArea: b.mutation({ query: (body) => ({ url: '/service-areas/check', method: 'POST', body }) }),
    getServiceAreas: b.query({ query: (p = {}) => ({ url: '/service-areas', params: p }), providesTags: ['ServiceAreas'] }),
    createServiceArea: b.mutation({ query: (body) => ({ url: '/service-areas', method: 'POST', body }), invalidatesTags: ['ServiceAreas'] }),
    updateServiceArea: b.mutation({ query: ({ id, ...body }) => ({ url: `/service-areas/${id}`, method: 'PUT', body }), invalidatesTags: ['ServiceAreas'] }),
    deleteServiceArea: b.mutation({ query: (id) => ({ url: `/service-areas/${id}`, method: 'DELETE' }), invalidatesTags: ['ServiceAreas'] }),
    validateCoupon: b.mutation({ query: (body) => ({ url: '/coupons/validate', method: 'POST', body }) }),
    getCoupons: b.query({ query: () => '/coupons', providesTags: ['Coupons'] }),
    createCoupon: b.mutation({ query: (body) => ({ url: '/coupons', method: 'POST', body }), invalidatesTags: ['Coupons'] }),
    updateCoupon: b.mutation({ query: ({ id, ...body }) => ({ url: `/coupons/${id}`, method: 'PUT', body }), invalidatesTags: ['Coupons'] }),
    deleteCoupon: b.mutation({ query: (id) => ({ url: `/coupons/${id}`, method: 'DELETE' }), invalidatesTags: ['Coupons'] }),
    getLogs: b.query({ query: (p = {}) => ({ url: '/logs', params: p }), providesTags: ['Logs'] }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllCustomersQuery, useGetCustomerQuery, useToggleCustomerMutation,
  useTogglePayLaterMutation,
  useGetAddressesQuery, useAddAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation,
  useCheckServiceAreaMutation, useGetServiceAreasQuery, useCreateServiceAreaMutation,
  useUpdateServiceAreaMutation, useDeleteServiceAreaMutation,
  useValidateCouponMutation, useGetCouponsQuery, useCreateCouponMutation,
  useUpdateCouponMutation, useDeleteCouponMutation,
  useGetLogsQuery,
} = customerApi;
