import apiClient from './apiClient';

export const nomineeApi = {
  // CREATE
  create: async (data) => {
    const response = await apiClient.post('/nominees', data);
    return response.data;
  },

  // READ (All)
  getAll: async () => {
    const response = await apiClient.get('/nominees');
    return response.data;
  },

  // READ (Single)
  getOne: async (id) => {
    const response = await apiClient.get(`/nominees/${id}`);
    return response.data;
  },

  // READ (My Nominee)
  getMyNominee: async () => {
    const response = await apiClient.get('/nominees/my');
    return response.data;
  },

  // UPDATE
  update: async (id, data) => {
    const response = await apiClient.put(`/nominees/${id}`, data);
    return response.data;
  },

  // DELETE
  delete: async (id) => {
    const response = await apiClient.delete(`/nominees/${id}`);
    return response.data;
  },

  // Link to User
  linkToUser: async (userId, nomineeId) => {
    const response = await apiClient.put(`/nominees/user/${userId}/nominee`, { nomineeId });
    return response.data;
  },
};