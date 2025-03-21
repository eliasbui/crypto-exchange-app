import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { create } from 'zustand';
import Constants from 'expo-constants';

interface NotificationState {
  hasPermission: boolean;
  expoPushToken: string | null;
  notifications: NotificationItem[];
  setPermission: (status: boolean) => void;
  setPushToken: (token: string) => void;
  addNotification: (notification: NotificationItem) => void;
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'transaction' | 'security' | 'system';
  timestamp: number;
  read: boolean;
  data?: any;
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Create notification store
export const useNotificationStore = create<NotificationState>((set) => ({
  hasPermission: false,
  expoPushToken: null,
  notifications: [],
  setPermission: (status) => set({ hasPermission: status }),
  setPushToken: (token) => set({ expoPushToken: token }),
  addNotification: (notification) => 
    set((state) => ({ 
      notifications: [notification, ...state.notifications] 
    })),
  clearNotifications: () => set({ notifications: [] }),
  markAsRead: (id) => 
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    })),
}));

class NotificationService {
  async initialize() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }

      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Set project ID from app config
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (projectId && typeof projectId === 'string') {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            enableVibrate: true,
            enableLights: true,
          });
        }
      }

      // Get push token if permission granted
      if (finalStatus === 'granted') {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        useNotificationStore.getState().setPushToken(token);
      }

      // Set up notification listeners
      const notificationListener = Notifications.addNotificationReceivedListener(
        this.handleNotificationReceived
      );
      
      const responseListener = Notifications.addNotificationResponseReceivedListener(
        this.handleNotificationResponse
      );

      return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      };
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  handleNotificationReceived = (notification: Notifications.Notification) => {
    console.log('Notification received:', notification);
  };

  handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    console.log('Notification response:', response);
  };

  static async sendLocalNotification(
    title: string,
    body: string,
    data?: any,
    options: Partial<Notifications.NotificationRequestInput> = {}
  ) {
    try {
      const notificationContent: Notifications.NotificationRequestInput = {
        content: {
          title,
          body,
          data,
          sound: true,
          priority: 'high',
          ...options,
        },
        trigger: null, // Send immediately
      };

      await Notifications.scheduleNotificationAsync(notificationContent);
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  static async sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: any
  ) {
    try {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data,
      };

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  static async sendTransactionNotification(
    type: 'buy' | 'sell',
    amount: string,
    cryptoSymbol: string,
    price: string
  ) {
    const title = `${type === 'buy' ? 'Bought' : 'Sold'} ${cryptoSymbol}`;
    const body = `Successfully ${type === 'buy' ? 'purchased' : 'sold'} ${amount} ${cryptoSymbol} at ${price}`;
    
    // Send both local and push notification
    await this.sendLocalNotification(title, body, {
      type: 'transaction',
      transactionType: type,
      amount,
      cryptoSymbol,
      price,
    });

    const expoPushToken = useNotificationStore.getState().expoPushToken;
    if (expoPushToken) {
      await this.sendPushNotification(expoPushToken, title, body, {
        type: 'transaction',
        transactionType: type,
        amount,
        cryptoSymbol,
        price,
      });
    }
  }
}

export default new NotificationService(); 