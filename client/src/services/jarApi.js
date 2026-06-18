import { baseApi } from './baseApi';
export const jarApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getMyJars: b.query({ query: () => '/jars/my', providesTags: ['Jars'] }),
    getAllJars: b.query({ query: (p={}) => ({ url: '/jars', params: p }), providesTags: ['Jars'] }),
    addJarEntry: b.mutation({ query: (body) => ({ url: '/jars', method: 'POST', body }), invalidatesTags: ['Jars','Customers'] }),
    getJarSummary: b.query({ query: (id) => `/jars/summary/${id}`, providesTags: ['Jars'] }),
    updateJarEntry: b.mutation({ query: ({ id, ...body }) => ({ url: `/jars/${id}`, method: 'PATCH', body }), invalidatesTags: ['Jars'] }),
    requestJarReturn: b.mutation({ query: (body) => ({ url: '/jars/return-request', method: 'POST', body }), invalidatesTags: ['Jars','Auth'] }),
  }),
  overrideExisting: false,
});
export const { useGetMyJarsQuery, useGetAllJarsQuery, useAddJarEntryMutation, useGetJarSummaryQuery, useUpdateJarEntryMutation, useRequestJarReturnMutation } = jarApi;
