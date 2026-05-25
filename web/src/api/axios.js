import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

let lastToast = '';
let lastToastTime = 0;

function showError(message) {
  const now = Date.now();
  if (message === lastToast && now - lastToastTime < 2000) return;
  lastToast = message;
  lastToastTime = now;
  toast.error(message);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pharmasys_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRequest = err.config?.url?.includes('/auth/login');
    const message =
      err.response?.data?.message ||
      (err.code === 'ERR_NETWORK'
        ? 'Cannot reach API. Start the backend: cd backend && npm run dev'
        : 'Something went wrong');

    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('pharmasys_token');
      localStorage.removeItem('pharmasys_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (!isLoginRequest || err.response) {
      showError(message);
    }

    return Promise.reject(err);
  }
);

export default api;
