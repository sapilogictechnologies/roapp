import { baseApi } from './baseApi';

export const eventApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    createEvent: b.mutation({ query: (body) => ({ url: '/events', method: 'POST', body }), invalidatesTags: ['Events', 'Notifications'] }),
    getMyEvents: b.query({ query: (p = {}) => ({ url: '/events/my', params: p }), providesTags: ['Events'] }),
    getMyEvent: b.query({ query: (id) => `/events/my/${id}`, providesTags: ['Events'] }),
    getAllEvents: b.query({ query: (p = {}) => ({ url: '/events', params: p }), providesTags: ['Events'] }),
    getEvent: b.query({ query: (id) => `/events/${id}`, providesTags: ['Events'] }),
    updateEventQuote: b.mutation({ query: ({ id, ...body }) => ({ url: `/events/${id}/quote`, method: 'PATCH', body }), invalidatesTags: ['Events', 'Notifications'] }),
    respondToEventQuote: b.mutation({ query: ({ id, ...body }) => ({ url: `/events/${id}/quote-response`, method: 'PATCH', body }), invalidatesTags: ['Events', 'Notifications'] }),
    acceptEventQuote: b.mutation({ query: (id) => ({ url: `/events/${id}/quote/accept`, method: 'PATCH' }), invalidatesTags: ['Events', 'Notifications'] }),
    rejectEventQuote: b.mutation({ query: ({ id, ...body }) => ({ url: `/events/${id}/quote/reject`, method: 'PATCH', body }), invalidatesTags: ['Events', 'Notifications'] }),
    updateEventStatus: b.mutation({ query: ({ id, ...body }) => ({ url: `/events/${id}/status`, method: 'PATCH', body }), invalidatesTags: ['Events', 'Notifications'] }),
  }),
  overrideExisting: false,
});

export const {
  useCreateEventMutation, useGetMyEventsQuery, useGetMyEventQuery,
  useGetAllEventsQuery, useGetEventQuery, useUpdateEventQuoteMutation,
  useRespondToEventQuoteMutation, useAcceptEventQuoteMutation,
  useRejectEventQuoteMutation, useUpdateEventStatusMutation,
} = eventApi;
