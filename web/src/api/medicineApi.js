import api from './axios';

export const medicineApi = {
  list: (params) => api.get('/medicines', { params }),
  get: (id) => api.get(`/medicines/${id}`),
  byBarcode: (barcode) => api.get(`/medicines/barcode/${barcode}`),
  categories: () => api.get('/medicines/categories'),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  archive: (id) => api.patch(`/medicines/${id}/archive`),
  restore: (id) => api.patch(`/medicines/${id}/restore`),
  remove: (id) => api.delete(`/medicines/${id}`),
};
