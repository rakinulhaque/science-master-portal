import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import API_CONFIG from '../../config/api';

export const createBaseQuery = () => fetchBaseQuery({
  baseUrl: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
