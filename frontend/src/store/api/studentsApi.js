import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from './baseQuery';

const baseQuery = createBaseQuery();

export const studentsApi = createApi({
  reducerPath: 'studentsApi',
  baseQuery,
  tagTypes: ['Student'],
  endpoints: (builder) => ({
    getStudents: builder.query({
      query: ({ page = 1, limit = 15, search = '', institution = '', batchId = '', branchId = '' } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (institution) params.append('institution', institution);
        if (batchId) params.append('batchId', batchId);
        if (branchId) params.append('branchId', branchId);
        
        return `/students?${params.toString()}`;
      },
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
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `/students/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student'],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useCreateStudentMutation,
  useAddPaymentMutation,
  useDeleteStudentMutation,
} = studentsApi;
