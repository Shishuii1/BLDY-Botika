import api from './axios';

export const reportApi = {
  sales: (params) => api.get('/reports/sales', { params }),
  inventory: () => api.get('/reports/inventory'),
  financial: (params) => api.get('/reports/financial', { params }),
  salesPdf: (params) => api.get('/reports/sales/pdf', { params, responseType: 'blob' }),
  salesExcel: (params) => api.get('/reports/sales/excel', { params, responseType: 'blob' }),
};
