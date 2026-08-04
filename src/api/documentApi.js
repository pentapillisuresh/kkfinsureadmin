import apiClient from './apiClient';

export const documentApi = {
  // CREATE
  upload: async (formData) => {
    const response = await apiClient.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // READ (All)
  getAll: async (params) => {
    const response = await apiClient.get('/documents', { params });
    return response.data;
  },

  // READ (Single)
  getOne: async (id) => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  // READ (User's own)
  getMyDocuments: async (params) => {
    const response = await apiClient.get('/documents/my', { params });
    return response.data;
  },

  // READ (By User - Admin)
  getUserDocuments: async (userId) => {
    const response = await apiClient.get(`/documents/user/${userId}`);
    return response.data;
  },

  // UPDATE
  update: async (id, data) => {
    const response = await apiClient.put(`/documents/${id}`, data);
    return response.data;
  },

  // DELETE
  delete: async (id) => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },

  // Company Documents
  uploadCompany: async (formData) => {
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
};