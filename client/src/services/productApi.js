import { baseApi } from './baseApi';

export const productApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getProducts: b.query({ query: (p = {}) => ({ url: '/products', params: p }), providesTags: ['Products'] }),
    getProduct: b.query({ query: (id) => `/products/${id}`, providesTags: ['Products'] }),
    createProduct: b.mutation({ query: (body) => ({ url: '/products', method: 'POST', body }), invalidatesTags: ['Products'] }),
    updateProduct: b.mutation({ query: ({ id, ...body }) => ({ url: `/products/${id}`, method: 'PUT', body }), invalidatesTags: ['Products'] }),
    deleteProduct: b.mutation({ query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }), invalidatesTags: ['Products'] }),
    toggleProduct: b.mutation({ query: (id) => ({ url: `/products/${id}/toggle`, method: 'PATCH' }), invalidatesTags: ['Products'] }),
    getCategories: b.query({ query: () => '/categories', providesTags: ['Categories'] }),
    createCategory: b.mutation({ query: (body) => ({ url: '/categories', method: 'POST', body }), invalidatesTags: ['Categories'] }),
    updateCategory: b.mutation({ query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: 'PUT', body }), invalidatesTags: ['Categories'] }),
    deleteCategory: b.mutation({ query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }), invalidatesTags: ['Categories'] }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery, useGetProductQuery, useCreateProductMutation,
  useUpdateProductMutation, useDeleteProductMutation, useToggleProductMutation,
  useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation,
} = productApi;
