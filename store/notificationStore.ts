import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export type NotificationType = 
  | 'trade' 
  | 'price' 
  | 'security' 
  | 'transaction' 
  | 'promotion';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  data?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
  loadNotifications: () => Promise<void>;
}

const showToast = (notification: Notification) => {
  Toast.show({
    type: notification.type === 'security' ? 'error' : 'success',
    text1: notification.title,
    text2: notification.message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 50,
  });
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      isRead: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    // Show toast notification
    showToast(newNotification);

    // Save to AsyncStorage
    const notifications = [newNotification, ...get().notifications];
    AsyncStorage.setItem('notifications', JSON.stringify(notifications));
  },

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      };
    });

    // Save to AsyncStorage
    AsyncStorage.setItem('notifications', JSON.stringify(get().notifications));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));

    // Save to AsyncStorage
    AsyncStorage.setItem('notifications', JSON.stringify(get().notifications));
  },

  deleteNotification: (id) => {
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      };
    });

    // Save to AsyncStorage
    AsyncStorage.setItem('notifications', JSON.stringify(get().notifications));
  },

  deleteAllNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
    AsyncStorage.removeItem('notifications');
  },

  loadNotifications: async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        const notifications = JSON.parse(stored) as Notification[];
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        });
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  },
})); 