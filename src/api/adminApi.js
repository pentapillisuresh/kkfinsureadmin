// src/api/adminApi.js
import apiClient from './apiClient';

export const adminApi = {
  // Users
  getDashboard: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },
  
  // Users
  getUsers: async (params) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },
  
  getUser: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },
  
  updateUser: async (id, data) => {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response.data;
  },
  
  toggleUserStatus: async (id) => {
    const response = await apiClient.put(`/admin/users/${id}/status`);
    return response.data;
  },

  // Bank Details
  getBankDetailsAll: async (params) => {
    const response = await apiClient.get('/admin/bank-details', { params });
    return response.data;
  },
  
  getUserBankDetails: async (userId) => {
    const response = await apiClient.get(`/admin/bank-details/user/${userId}`);
    return response.data;
  },
  
  upsertBankDetails: async (userId, data) => {
    const response = await apiClient.put(`/admin/bank-details/user/${userId}`, data);
    return response.data;
  },
  
  deleteBankDetails: async (userId) => {
    const response = await apiClient.delete(`/admin/bank-details/user/${userId}`);
    return response.data;
  },
  
  verifyBankDetails: async (userId) => {
    const response = await apiClient.patch(`/admin/bank-details/user/${userId}/verify`);
    return response.data;
  },

  // Nominees
  getNominees: async (params) => {
    const response = await apiClient.get('/admin/nominees', { params });
    return response.data;
  },
  
  getNominee: async (id) => {
    const response = await apiClient.get(`/admin/nominees/${id}`);
    return response.data;
  },
  
  createNominee: async (data) => {
    const response = await apiClient.post('/admin/nominees', data);
    return response.data;
  },
  
  updateNominee: async (id, data) => {
    const response = await apiClient.put(`/admin/nominees/${id}`, data);
    return response.data;
  },
  
  deleteNominee: async (id) => {
    const response = await apiClient.delete(`/admin/nominees/${id}`);
    return response.data;
  },
  
  linkNomineeToUser: async (userId, nomineeId) => {
    const response = await apiClient.put(`/admin/nominees/user/${userId}/nominee`, { nomineeId });
    return response.data;
  },

  // Documents
  getDocuments: async (params) => {
    const response = await apiClient.get('/admin/documents', { params });
    return response.data;
  },
  
  getDocument: async (id) => {
    const response = await apiClient.get(`/admin/documents/${id}`);
    return response.data;
  },
  
  uploadDocument: async (formData) => {
    const response = await apiClient.post('/admin/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  updateDocument: async (id, data) => {
    const response = await apiClient.put(`/admin/documents/${id}`, data);
    return response.data;
  },
  
  deleteDocument: async (id) => {
    const response = await apiClient.delete(`/admin/documents/${id}`);
    return response.data;
  },
  
  getUserDocuments: async (userId) => {
    const response = await apiClient.get(`/admin/documents/user/${userId}`);
    return response.data;
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  // DPC Approval
  approveDPC: async (investmentId) => {
    const response = await apiClient.put(`/admin/investments/${investmentId}/dpc`);
    return response.data;
  },

  // Company Documents
  uploadCompanyDocument: async (formData) => {
    const response = await apiClient.post('/admin/company-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getCompanyDocuments: async () => {
    const response = await apiClient.get('/admin/company-documents');
    return response.data;
  },
  
  deleteCompanyDocument: async (id) => {
    const response = await apiClient.delete(`/admin/company-documents/${id}`);
    return response.data;
  },

  // Balance Sheet
  generateBalanceSheet: async (data) => {
    const response = await apiClient.post('/admin/balance-sheet/generate', data);
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async () => {
    const response = await apiClient.get('/admin/logs');
    return response.data;
  },
};