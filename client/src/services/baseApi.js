import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      // Try Redux state first, then localStorage
      const token = getState().auth?.token || localStorage.getItem('ro_token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 60,
  tagTypes: [
    'Auth', 'Products', 'Categories', 'Orders', 'Customers', 'Pricing',
    'TimeSlots', 'Payments', 'Bills', 'Jars', 'Subscriptions', 'Events',
    'Notifications', 'Settings', 'Reports', 'Coupons', 'Logs', 'ServiceAreas',
    'Messages',
  ],
  endpoints: () => ({}),
});
