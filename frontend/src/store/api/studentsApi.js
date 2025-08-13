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
