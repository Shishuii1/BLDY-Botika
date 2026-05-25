import api from './axios';

export const salesApi = {
  list: (params) => api.get('/sales', { params }),
  get: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  return: (data) => api.post('/sales/return', data),
  receiptUrl: (id) => {
    const base = import.meta.env.VITE_API_URL || '/api';
    const path = base.startsWith('http') ? base : `${window.location.origin}${base}`;
    return `${path.replace(/\/$/, '')}/sales/${id}/receipt`;
  },
};
