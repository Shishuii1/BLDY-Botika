import api from './axios';

export const notificationApi = {
  list: (unread) => api.get('/notifications', { params: { unread: unread ? 'true' : undefined } }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
