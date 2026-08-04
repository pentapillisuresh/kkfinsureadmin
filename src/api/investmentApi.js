import apiClient from './apiClient';

export const investmentApi = {
  // CREATE
  create: async (data) => {
    const response = await apiClient.post('/investments', data);
    return response.data;
  },

  // READ (List)
  getAll: async (params) => {
    const response = await apiClient.get('/investments', { params });
    return response.data;
  },

  // READ (Single)
  getOne: async (id) => {
    const response = await apiClient.get(`/investments/${id}`);
    return response.data;
  },

  // UPDATE
  update: async (id, data) => {
    const response = await apiClient.put(`/investments/${id}`, data);
    return response.data;
  },

  // DELETE
  delete: async (id) => {
    const response = await apiClient.delete(`/investments/${id}`);
    return response.data;
  },

  // Additional Operations
  approveDPC: async (id) => {
    const response = await apiClient.put(`/admin/investments/${id}/dpc`);
    return response.data;
  },

  uploadDocs: async (id, data) => {
    const response = await apiClient.post(`/investments/${id}/documents`, data);
    return response.data;
  },

  // User's own investments
  getMyInvestments: async (params) => {
    const response = await apiClient.get('/investments/my', { params });
    return response.data;
  },
};