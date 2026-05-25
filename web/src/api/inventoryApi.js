import api from './axios';

export const inventoryApi = {
  summary: () => api.get('/inventory/summary'),
  lowStock: () => api.get('/inventory/low-stock'),
  expiring: (days) => api.get('/inventory/expiring', { params: { days } }),
  logs: (params) => api.get('/inventory/logs', { params }),
  adjust: (data) => api.post('/inventory/adjust', data),
  updateStock: (id, data) => api.put(`/inventory/stock/${id}`, data),
};
