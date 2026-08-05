import apiClient from './apiClient';

export const filesAPI = {
  // Admin only – upload single file
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/files/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // Admin only – upload multiple files
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return apiClient.post('/files/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // Download file (authenticated)
  downloadFile: (filename) => apiClient.get(`/files/${filename}`, { responseType: 'blob' }),
};