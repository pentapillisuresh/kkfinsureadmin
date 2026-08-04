import apiClient from './apiClient';

export const commissionApi = {
  // READ (User's own)
  getMyCommissions: async (params) => {
    const response = await apiClient.get('/partner-commissions/my', { params });
    return response.data;
  },

  // READ (All - Admin)
  getAll: async (params) => {
    const response = await apiClient.get('/partner-commissions', { params });
    return response.data;
  },

  // READ (Single)
  getOne: async (id) => {
    const response = await apiClient.get(`/partner-commissions/${id}`);
    return response.data;
  },

  // READ (By User)
  getUserCommissions: async (userId, params) => {
    const response = await apiClient.get(`/partner-commissions/user/${userId}`, { params });
    return response.data;
  },

  // PROCESS (Monthly)
  processMonthly: async () => {
    const response = await apiClient.post('/partner-commissions/process');
    return response.data;
  },

  // MARK AS PAID
  markAsPaid: async (id) => {
    const response = await apiClient.put(`/partner-commissions/${id}/pay`);
    return response.data;
  },

  // BATCH MARK AS PAID
  batchMarkAsPaid: async (data) => {
    const response = await apiClient.put('/partner-commissions/batch/pay', data);
    return response.data;
  },
};