import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  me: () => api.get('/auth/me'),
  roles: () => api.get('/auth/roles'),
  listUsers: () => api.get('/auth/users'),
  createUser: (data) => api.post('/auth/users', data),
};
