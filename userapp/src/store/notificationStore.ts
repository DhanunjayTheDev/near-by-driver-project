import {create} from 'zustand';

export interface AppNotification {
  _id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;

  setNotifications: (items: AppNotification[]) => void;
  addNotification: (item: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (items: AppNotification[]) => {
    const unread = items.filter(n => !n.is_read).length;
    set({notifications: items, unreadCount: unread});
  },

  addNotification: (item: AppNotification) => {
    set(state => ({
      notifications: [item, ...state.notifications],
      unreadCount: item.is_read
        ? state.unreadCount
        : state.unreadCount + 1,
    }));
  },

  markRead: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n._id === id ? {...n, is_read: true} : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({...n, is_read: true})),
      unreadCount: 0,
    }));
  },

  setUnreadCount: (count: number) => set({unreadCount: count}),
}));
