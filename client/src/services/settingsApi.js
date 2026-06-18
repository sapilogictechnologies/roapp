import { baseApi } from './baseApi';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getPublicSettings: b.query({ query: () => '/settings/public', providesTags: ['Settings'] }),
    getSettings: b.query({ query: () => '/settings', providesTags: ['Settings'] }),
    updateSettings: b.mutation({ query: (body) => ({ url: '/settings', method: 'PUT', body }), invalidatesTags: ['Settings'] }),
  }),
  overrideExisting: false,
});

export const { useGetPublicSettingsQuery, useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
