import { baseApi } from './baseApi';

export const reportApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getDashboard: b.query({ query: () => '/reports/dashboard', providesTags: ['Reports'] }),
    getSalesReport: b.query({ query: (p = {}) => ({ url: '/reports/sales', params: p }), providesTags: ['Reports'] }),
    getProductsReport: b.query({ query: () => '/reports/products', providesTags: ['Reports'] }),
    getCustomersReport: b.query({ query: () => '/reports/customers', providesTags: ['Reports'] }),
    getPaymentsReport: b.query({ query: () => '/reports/payments', providesTags: ['Reports'] }),
    getJarsReport: b.query({ query: () => '/reports/jars', providesTags: ['Reports'] }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardQuery, useGetSalesReportQuery, useGetProductsReportQuery,
  useGetCustomersReportQuery, useGetPaymentsReportQuery, useGetJarsReportQuery,
} = reportApi;
