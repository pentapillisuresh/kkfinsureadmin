import apiClient from './apiClient';

// ============================================================
// Partner Tier API
// ============================================================
export const partnerTierApi = {
  // CREATE
  create: async (data) => {
    const response = await apiClient.post('/partner-tiers', data);
    return response.data;
  },

  // READ (Active)
  getActive: async () => {
    const response = await apiClient.get('/partner-tiers');
    return response.data;
  },

  // READ (Single)
  getOne: async (id) => {
    const response = await apiClient.get(`/partner-tiers/${id}`);
    return response.data;
  },

  // UPDATE
  update: async (id, data) => {
    const response = await apiClient.put(`/partner-tiers/${id}`, data);
    return response.data;
  },

  // DELETE
  delete: async (id) => {
    const response = await apiClient.delete(`/partner-tiers/${id}`);
    return response.data;
  },

  // Toggle Status
  toggleStatus: async (id) => {
    const response = await apiClient.patch(`/partner-tiers/${id}/status`);
    return response.data;
  },

  // Assign to User
  assignToUser: async (userId, tierName) => {
    const response = await apiClient.put(`/partner-tiers/user/${userId}/tier`, { tierName });
    return response.data;
  },
};

// ============================================================
// Partner Commission API
// ============================================================
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

// ============================================================
// Default Export (for backward compatibility)
// ============================================================
const partnerApi = {
  ...partnerTierApi,
  ...commissionApi,
};

export default partnerApi;