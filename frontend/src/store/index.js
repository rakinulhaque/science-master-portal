import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { studentsApi } from './api/studentsApi';
import { batchesApi } from './api/batchesApi';
import { branchesApi } from './api/branchesApi';
import authSlice from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [authApi.reducerPath]: authApi.reducer,
    [studentsApi.reducerPath]: studentsApi.reducer,
    [batchesApi.reducerPath]: batchesApi.reducer,
    [branchesApi.reducerPath]: branchesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      studentsApi.middleware,
      batchesApi.middleware,
      branchesApi.middleware
    ),
});
