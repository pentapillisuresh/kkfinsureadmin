import apiClient from './apiClient';

export const userApi = {
  getUsers: async (params) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },
  getUser: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response.data;
  },
  toggleStatus: async (id) => {
    const response = await apiClient.put(`/admin/users/${id}/status`);
    return response.data;
  },
};