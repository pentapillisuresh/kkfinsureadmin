import apiClient from './apiClient';

export const referralApi = {
  // CREATE
  create: async (data) => {
    const response = await apiClient.post('/referrals', data);
    return response.data;
  },

  // READ (User's own)
  getMyReferrals: async (params) => {
    const response = await apiClient.get('/referrals/my', { params });
    return response.data;
  },

  // READ (All - Admin)
  getAll: async (params) => {
    const response = await apiClient.get('/referrals', { params });
    return response.data;
  },

  // READ (Single)
  getOne: async (id) => {
    const response = await apiClient.get(`/referrals/${id}`);
    return response.data;
  },

  // READ (By User)
  getUserReferrals: async (userId) => {
    const response = await apiClient.get(`/referrals/user/${userId}`);
    return response.data;
  },

  // UPDATE (Reward)
  updateReward: async (id, data) => {
    const response = await apiClient.put(`/referrals/${id}/reward`, data);
    return response.data;
  },

  // DELETE
  delete: async (id) => {
    const response = await apiClient.delete(`/referrals/${id}`);
    return response.data;
  },

  // Stats
  getStats: async () => {
    const response = await apiClient.get('/referrals/my/stats');
    return response.data;
  },
};