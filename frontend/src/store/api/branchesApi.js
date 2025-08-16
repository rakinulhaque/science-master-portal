import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from './baseQuery';

const baseQuery = createBaseQuery();

export const branchesApi = createApi({
  reducerPath: 'branchesApi',
  baseQuery,
  tagTypes: ['Branch'],
  endpoints: (builder) => ({
    getBranches: builder.query({
      query: () => '/branches/list-branches',
      providesTags: ['Branch'],
    }),
    getBranchById: builder.query({
      query: (id) => `/branches/list-branches/${id}`,
      providesTags: (result, error, id) => [{ type: 'Branch', id }],
    }),
    createBranch: builder.mutation({
      query: (newBranch) => ({
        url: '/branches/create',
        method: 'POST',
        body: newBranch,
      }),
      invalidatesTags: ['Branch'],
    }),
    updateBranch: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/branches/update/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Branch', id }],
    }),
    deleteBranch: builder.mutation({
      query: (id) => ({
        url: `/branches/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Branch'],
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useGetBranchByIdQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchesApi;
