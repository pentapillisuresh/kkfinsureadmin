// src/api/authApi.js
import apiClient from './apiClient';

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.put('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },

  createUser: async (userData) => {
    const response = await apiClient.post('/auth/admin/create-user', userData);
    return response.data;
  },
};