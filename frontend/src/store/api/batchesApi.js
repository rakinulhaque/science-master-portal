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
    getBatchById: builder.query({
      query: (id) => `/batches/${id}`,
      providesTags: (result, error, id) => [{ type: 'Batch', id }],
    }),
    getBatchesByBranch: builder.query({
      query: (branchId) => `/batches/branch/${branchId}`,
      providesTags: ['Batch'],
    }),
    createBatch: builder.mutation({
      query: (newBatch) => ({
        url: '/batches',
        method: 'POST',
        body: newBatch,
      }),
      invalidatesTags: ['Batch'],
    }),
    updateBatch: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/batches/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Batch', id }],
    }),
    deleteBatch: builder.mutation({
      query: (id) => ({
        url: `/batches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Batch'],
    }),
  }),
});

export const {
  useGetBatchesQuery,
  useGetBatchByIdQuery,
  useGetBatchesByBranchQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
} = batchesApi;
