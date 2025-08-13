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

export const batchesApi = createApi({
  reducerPath: 'batchesApi',
  baseQuery,
  tagTypes: ['Batch'],
  endpoints: (builder) => ({
    getBatches: builder.query({
      query: () => '/batches',
      providesTags: ['Batch'],
    }),
    getBatchesByBranch: builder.query({
      query: (branchId) => `/batches/branch/${branchId}`,
      providesTags: ['Batch'],
    }),
  }),
});

export const {
  useGetBatchesQuery,
  useGetBatchesByBranchQuery,
} = batchesApi;
