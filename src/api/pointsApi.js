import apiClient from './apiClient';

export const pointsApi = {
  // READ (My Points)
  getMyPoints: async () => {
    const response = await apiClient.get('/user-points/my');
    return response.data;
  },

  // READ (My History)
  getMyHistory: async (params) => {
    const response = await apiClient.get('/user-points/my/history', { params });
    return response.data;
  },

  // READ (All - Admin)
  getAll: async (params) => {
    const response = await apiClient.get('/user-points', { params });
    return response.data;
  },

  // READ (By User)
  getUserPoints: async (userId) => {
    const response = await apiClient.get(`/user-points/user/${userId}`);
    return response.data;
  },

  // CREATE
  addPoints: async (data) => {
    const response = await apiClient.post('/user-points', data);
    return response.data;
  },

  // BATCH CREATE
  batchAddPoints: async (data) => {
    const response = await apiClient.post('/user-points/batch', data);
    return response.data;
  },

  // DELETE
  delete: async (id) => {
    const response = await apiClient.delete(`/user-points/${id}`);
    return response.data;
  },

  // EXPIRE
  expire: async (id, expiresAt) => {
    const response = await apiClient.put(`/user-points/${id}/expire`, { expiresAt });
    return response.data;
  },
};