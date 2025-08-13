import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3001/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const branchesApi = createApi({
  reducerPath: 'branchesApi',
  baseQuery,
  tagTypes: ['Branch'],
  endpoints: (builder) => ({
    getBranches: builder.query({
      query: () => '/branches',
      providesTags: ['Branch'],
    }),
  }),
});

export const {
  useGetBranchesQuery,
} = branchesApi;
