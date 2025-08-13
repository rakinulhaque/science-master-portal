import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from './baseQuery';

const baseQuery = createBaseQuery();

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
