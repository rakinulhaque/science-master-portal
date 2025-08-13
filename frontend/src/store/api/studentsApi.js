import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from './baseQuery';

const baseQuery = createBaseQuery();

export const studentsApi = createApi({
  reducerPath: 'studentsApi',
  baseQuery,
  tagTypes: ['Student'],
  endpoints: (builder) => ({
    getStudents: builder.query({
      query: () => '/students',
      providesTags: ['Student'],
    }),
    createStudent: builder.mutation({
      query: (studentData) => ({
        url: '/students',
        method: 'POST',
        body: studentData,
      }),
      invalidatesTags: ['Student'],
    }),
    addPayment: builder.mutation({
      query: ({ studentId, paymentData }) => ({
        url: `/students/${studentId}/payments`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Student'],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useCreateStudentMutation,
  useAddPaymentMutation,
} = studentsApi;
