import { create } from 'zustand';
import { UIState, ThemeType } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

// Storage keys
const THEME_KEY = '@crypto_exchange_theme';
const LANGUAGE_KEY = '@crypto_exchange_language';
const NOTIFICATIONS_KEY = '@crypto_exchange_notifications';

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  language: 'en',
  notificationsEnabled: true,

  // Set theme explicitly
  setTheme: async (theme: ThemeType) => {
    set({ theme });
    
    // Save to AsyncStorage
    AsyncStorage.setItem(THEME_KEY, theme);
  },

  // Toggle between light and dark theme
  toggleTheme: async () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      
      // Save to AsyncStorage
      AsyncStorage.setItem(THEME_KEY, newTheme);
      
      return { theme: newTheme };
    });
  },

  // Set language
  setLanguage: async (language: string) => {
    set({ language });
    
    // Save to AsyncStorage
    AsyncStorage.setItem(LANGUAGE_KEY, language);
  },

  // Toggle notifications
  toggleNotifications: async () => {
    set((state) => {
      const newNotificationsState = !state.notificationsEnabled;
      
      // Save to AsyncStorage
      AsyncStorage.setItem(NOTIFICATIONS_KEY, String(newNotificationsState));
      
      return { notificationsEnabled: newNotificationsState };
    });
  },
}));

// Function to initialize UI settings from AsyncStorage
export const initializeUI = async () => {
  try {
    // Get device color scheme
    const colorScheme = useColorScheme();
    
    // Get stored values from AsyncStorage
    const storedTheme = await AsyncStorage.getItem(THEME_KEY);
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    
    // Initialize state with stored values or defaults
    useUIStore.setState({
      theme: storedTheme as ThemeType || colorScheme || 'light',
      language: storedLanguage || 'en',
      notificationsEnabled: storedNotifications ? storedNotifications === 'true' : true,
    });
  } catch (error) {
    console.error('Initialize UI error:', error);
  }
}; 