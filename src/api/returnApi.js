import apiClient from './apiClient';

export const returnApi = {
  // READ (User's own)
  createReturns: async (data) => {
    const response = await apiClient.post('/returns', data );
    return response.data;
  },

  getMyReturns: async (params) => {
    const response = await apiClient.get('/returns/my', { params });
    return response.data;
  },

  // READ (Summary)
  getMySummary: async () => {
    const response = await apiClient.get('/returns/my/summary');
    return response.data;
  },

  // READ (All - Admin)
  getAll: async (params) => {
    console.log("return parama::",params)
    const response = await apiClient.get('/returns', {params} );
    return response.data;
  },

  // READ (By User)
  getUserReturns: async (userId, params) => {
    const response = await apiClient.get(`/returns/user/${userId}`, { params });
    return response.data;
  },

  // READ (Single)
  getOne: async (id) => {
    const response = await apiClient.get(`/returns/${id}`);
    return response.data;
  },

  // GENERATE (Monthly)
  generateMonthly: async (data) => {
    const response = await apiClient.post('/returns/generate', data);
    return response.data;
  },

  // GENERATE (Annual Bonus)
  generateAnnualBonus: async (data) => {
    const response = await apiClient.post('/returns/generate/annual-bonus', data);
    return response.data;
  },

  // MARK AS PAID
  markAsPaid: async (id) => {
    const response = await apiClient.put(`/returns/${id}/pay`);
    return response.data;
  },

  update: async (id,data) => {
    const response = await apiClient.put(`/returns/${id}`,data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/returns/${id}`);
    return response.data;
  },

  // BATCH MARK AS PAID
  batchMarkAsPaid: async (ids) => {
    const response = await apiClient.put('/returns/batch/pay', { ids });
    return response.data;
  },
};  