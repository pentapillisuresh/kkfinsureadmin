import apiClient from './apiClient';

export const planApi = {
  // CREATE
  create: async (data) => {
    const response = await apiClient.post('/plans', data);
    return response.data;
  },

  // READ (List)
  getAll: async (params) => {
    const response = await apiClient.get('/plans', { params });
    return response.data;
  },

  // READ (Single)
  getOne: async (id) => {
    const response = await apiClient.get(`/plans/${id}`);
    return response.data;
  },

  // UPDATE
  update: async (id, data) => {
    const response = await apiClient.put(`/plans/${id}`, data);
    return response.data;
  },

  // DELETE
  delete: async (id) => {
    const response = await apiClient.delete(`/plans/${id}`);
    return response.data;
  },

  // Toggle Status
  toggleStatus: async (id) => {
    const response = await apiClient.patch(`/plans/${id}/status`);
    return response.data;
  },
};