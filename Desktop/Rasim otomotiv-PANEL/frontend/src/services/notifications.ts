import api from './api';

export const notificationsService = {
  async getAll(): Promise<AppNotification[]> {
    const response = await api.get<AppNotification[]>('/notifications');
    return response.data;
  },

  async getUnread(): Promise<AppNotification[]> {
    const response = await api.get<AppNotification[]>('/notifications/unread');
    return response.data;
  },

  async markAsRead(id: string): Promise<AppNotification> {
    const response = await api.patch<AppNotification>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
  async add(notification: Omit<AppNotification, 'id' | 'created_at'>): Promise<AppNotification> {
    const response = await api.post<AppNotification>('/notifications', notification);
    return response.data;
  },
};
