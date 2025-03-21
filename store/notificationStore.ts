import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export type NotificationType = 
  | 'trade' 
  | 'price' 
  | 'security' 
  | 'transaction' 
  | 'promotion'
  | 'system';

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

// Fake notification data
const fakeNotifications: Omit<Notification, 'id' | 'timestamp'>[] = [
  {
    type: 'price',
    title: 'Bitcoin Price Alert',
    message: 'BTC has increased by 5% in the last hour',
    isRead: false,
  },
  {
    type: 'trade',
    title: 'Trade Executed',
    message: 'Your limit order for ETH has been filled',
    isRead: true,
  },
  {
    type: 'security',
    title: 'New Login Detected',
    message: 'A new login was detected from your device',
    isRead: false,
  },
  {
    type: 'transaction',
    title: 'Deposit Successful',
    message: 'Your deposit of $1,000 has been confirmed',
    isRead: true,
  },
  {
    type: 'promotion',
    title: 'Special Offer',
    message: 'Get 50% off trading fees this weekend',
    isRead: false,
  },
  {
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance in 2 hours',
    isRead: true,
  }
];

const showToast = (notification: Notification) => {
  Toast.show({
    type: 'info',
    text1: notification.title,
    text2: notification.message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
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

    showToast(newNotification);
    
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

    AsyncStorage.setItem('notifications', JSON.stringify(get().notifications));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));

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
      } else {
        // Load fake notifications if no stored notifications exist
        const notifications = fakeNotifications.map((n, index) => ({
          ...n,
          id: (Date.now() - index * 60000).toString(), // Stagger timestamps
          timestamp: Date.now() - index * 60000,
        }));
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        });
        AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  },
})); 