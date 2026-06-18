import { baseApi } from './baseApi';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getNotifications: b.query({ query: () => '/notifications', providesTags: ['Notifications'] }),
    getUnreadCount: b.query({ query: () => '/notifications/unread-count', providesTags: ['Notifications'] }),
    markRead: b.mutation({ query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }), invalidatesTags: ['Notifications'] }),
    markAllRead: b.mutation({ query: () => ({ url: '/notifications/read-all', method: 'PATCH' }), invalidatesTags: ['Notifications'] }),
    sendAnnouncement: b.mutation({ query: (body) => ({ url: '/notifications/admin-announcement', method: 'POST', body }), invalidatesTags: ['Notifications'] }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery, useGetUnreadCountQuery, useMarkReadMutation,
  useMarkAllReadMutation, useSendAnnouncementMutation,
} = notificationApi;
