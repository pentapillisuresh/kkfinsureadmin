import apiClient from './apiClient';

export const balanceSheetApi = {
  // READ (User's own)
  getMyBalanceSheets: async (params) => {
    const response = await apiClient.get('/balance-sheets/my', { params });
    return response.data;
  },
  getMyBalanceSheets: async (params) => {
    const response = await apiClient.get('/balance-sheets/my', { params });
    return response.data;
  },

  // READ (Single - My)
  getMyBalanceSheet: async (id) => {
    const response = await apiClient.get(`/balance-sheets/my/${id}`);
    return response.data;
  },

  getAllBalanceSheet: async (id) => {
    const response = await apiClient.get(`/admin/balance-sheets/all`);
    return response.data;
  },

  // READ (By User - Admin)
  getUserBalanceSheets: async (userId, params) => {
    const response = await apiClient.get(`/balance-sheets/user/${userId}`, { params });
    return response.data;
  },

  // READ (Single - Admin)
  getUserBalanceSheet: async (userId, id) => {
    const response = await apiClient.get(`/balance-sheets/user/${userId}/${id}`);
    return response.data;
  },

  // GENERATE
  generate: async (data) => {
    const response = await apiClient.post('/balance-sheets/generate', data);
    return response.data;
  },
};