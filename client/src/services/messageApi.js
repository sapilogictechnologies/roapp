import { baseApi } from './baseApi';

export const messageApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getMyMessages: b.query({
      query: () => '/messages/my',
      providesTags: ['Messages'],
    }),
    getAllMessages: b.query({
      query: (p = {}) => ({ url: '/messages', params: p }),
      providesTags: ['Messages'],
    }),
    getMessageUnreadCount: b.query({
      query: () => '/messages/unread-count',
      providesTags: ['Messages'],
    }),
    sendCustomerMessage: b.mutation({
      query: (body) => ({ url: '/messages/customer', method: 'POST', body }),
      invalidatesTags: ['Messages', 'Notifications'],
    }),
    sendAdminMessage: b.mutation({
      query: (body) => ({ url: '/messages/admin', method: 'POST', body }),
      invalidatesTags: ['Messages', 'Notifications'],
    }),
    markMessageRead: b.mutation({
      query: (id) => ({ url: `/messages/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Messages'],
    }),
    markAllMessagesRead: b.mutation({
      query: () => ({ url: '/messages/read-all', method: 'PATCH' }),
      invalidatesTags: ['Messages'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyMessagesQuery,
  useGetAllMessagesQuery,
  useGetMessageUnreadCountQuery,
  useSendCustomerMessageMutation,
  useSendAdminMessageMutation,
  useMarkMessageReadMutation,
  useMarkAllMessagesReadMutation,
} = messageApi;
