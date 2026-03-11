import { create } from 'zustand';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/apiService';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  total: 0,
  page: 1,
  isLoading: false,

  fetchNotifications: async (page = 1) => {
    set({ isLoading: true });
    try {
      const data = await getNotifications(page);
      const notifs = page === 1 ? data.notifications : [...get().notifications, ...data.notifications];
      const unread = notifs.filter((n) => !n.is_read).length;
      set({ notifications: notifs, total: data.total, page, unreadCount: unread, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: async (id) => {
    await markNotificationRead(id);
    const updated = get().notifications.map((n) =>
      n._id === id ? { ...n, is_read: true } : n
    );
    set({ notifications: updated, unreadCount: Math.max(0, get().unreadCount - 1) });
  },

  markAllRead: async () => {
    await markAllNotificationsRead();
    const updated = get().notifications.map((n) => ({ ...n, is_read: true }));
    set({ notifications: updated, unreadCount: 0 });
  },
}));

export default useNotificationStore;
