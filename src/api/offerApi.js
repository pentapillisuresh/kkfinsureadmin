import apiClient from './apiClient';

export const offerApi = {
  // CREATE
  create: async (data) => {
    const response = await apiClient.post('/offers', data);
    return response.data;
  },

  // READ (List - Active only for users)
  getActive: async () => {
    const response = await apiClient.get('/offers');
    return response.data;
  },

  // READ (All - Admin)
  getAll: async (params) => {
    const response = await apiClient.get('/offers/admin', { params });
    return response.data;
  },

  // READ (Single)
  getOne: async (id) => {
    const response = await apiClient.get(`/offers/${id}`);
    return response.data;
  },

  // UPDATE
  update: async (id, data) => {
    const response = await apiClient.put(`/offers/${id}`, data);
    return response.data;
  },

  // DELETE
  delete: async (id) => {
    const response = await apiClient.delete(`/offers/${id}`);
    return response.data;
  },

  // Toggle Status
  toggleStatus: async (id) => {
    const response = await apiClient.patch(`/offers/${id}/status`);
    return response.data;
  },
};