import apiClient from './apiClient';

export const ticketApi = {
  // CREATE (User)
  create: async (data) => {
    const response = await apiClient.post('/tickets', data);
    return response.data;
  },

  // READ (User's own)
  getMyTickets: async (params) => {
    const response = await apiClient.get('/tickets/my', { params });
    return response.data;
  },

  // READ (All - Admin)
  getAll: async (params) => {
    const response = await apiClient.get('/tickets', { params });
    return response.data;
  },

  // READ (Single)
  getOne: async (id) => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  // UPDATE (Status)
  updateStatus: async (id, status) => {
    const response = await apiClient.put(`/tickets/${id}/status`, { status });
    return response.data;
  },

  // UPDATE (Resolution)
  addResolution: async (id, resolution) => {
    const response = await apiClient.put(`/tickets/${id}/resolution`, { resolution });
    return response.data;
  },
};