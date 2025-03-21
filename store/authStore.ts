import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';
import { user as mockUser } from '../data/mockData';

// Storage keys
const AUTH_USER_KEY = '@crypto_exchange_auth_user';
const AUTH_STATUS_KEY = '@crypto_exchange_auth_status';
const AUTH_BIOMETRIC_ENABLED_KEY = '@crypto_exchange_biometric_enabled';
const AUTH_PIN_ENABLED_KEY = '@crypto_exchange_pin_enabled';
const AUTH_PIN_CODE_KEY = '@crypto_exchange_pin_code';
const AUTH_OTP_ENABLED_KEY = '@crypto_exchange_otp_enabled';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  tempEmail: '',
  otpPurpose: '',
  isOtpVerified: false,
  isBiometricEnabled: false,
  isPinEnabled: false,
  isOtpEnabled: false,
  pinCode: '',
  
  // Set temporary email for OTP verification
  setTempEmail: (email: string) => set({ tempEmail: email }),
  
  // Set OTP purpose (login, register, reset-password)
  setOtpPurpose: (purpose: string) => set({ otpPurpose: purpose }),
  
  // Verify OTP
  verifyOTP: async (otp: string) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // For demo, the valid OTP is always "123456"
      const isValid = otp === '123456';
      
      // Update state
      set({ isOtpVerified: isValid });
      return isValid;
    } catch (error) {
      console.error('OTP verification error:', error);
      return false;
    }
  },
  
  // Reset OTP verification status
  resetOtpVerification: () => set({ isOtpVerified: false }),

  // Login function - simulate API call with delay
  login: async (email: string, password: string) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo, just check if email and password are not empty
      if (email.trim() === '' || password.trim() === '') {
        return false;
      }

      // Store email for potential OTP verification
      set({ tempEmail: email, otpPurpose: 'login' });
      
      // Check if OTP is enabled - if yes, we'll stop here and redirect to OTP screen
      const isOtpEnabled = get().isOtpEnabled;
      if (isOtpEnabled) {
        return true; // Return true to indicate successful credentials check
      }

      // If OTP not enabled, proceed with login
      const user = mockUser;

      // Save to AsyncStorage
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(AUTH_STATUS_KEY, 'true');

      // Update state
      set({ user, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  // Complete login after OTP verification
  completeLogin: async () => {
    try {
      // In a real app, this would be an API call using the stored email
      const user = mockUser;
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(AUTH_STATUS_KEY, 'true');

      // Update state
      set({ user, isAuthenticated: true, isOtpVerified: false });
      return true;
    } catch (error) {
      console.error('Complete login error:', error);
      return false;
    }
  },

  // Register function - simulate API call with delay
  register: async (username: string, email: string, password: string) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate inputs
      if (username.trim() === '' || email.trim() === '' || password.trim() === '') {
        return false;
      }

      // Store email for potential OTP verification
      set({ tempEmail: email, otpPurpose: 'register' });
      
      // Check if OTP is enabled
      const isOtpEnabled = get().isOtpEnabled;
      if (isOtpEnabled) {
        return true; // Return true to indicate successful registration before OTP
      }

      // Create a new user with the given information
      const newUser: User = {
        ...mockUser,
        username,
        email,
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
      await AsyncStorage.setItem(AUTH_STATUS_KEY, 'true');

      // Update state
      set({ user: newUser, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  },

  // Complete registration after OTP verification
  completeRegistration: async (username: string) => {
    try {
      const email = get().tempEmail;
      
      // Create a new user with the stored information
      const newUser: User = {
        ...mockUser,
        username,
        email,
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
      await AsyncStorage.setItem(AUTH_STATUS_KEY, 'true');

      // Update state
      set({ user: newUser, isAuthenticated: true, isOtpVerified: false });
      return true;
    } catch (error) {
      console.error('Complete registration error:', error);
      return false;
    }
  },

  // Reset password function (after OTP verification)
  resetPassword: async (newPassword: string) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, this would call an API to reset the password
      // For demo purposes, we'll just return success
      
      // Reset OTP verification state
      set({ isOtpVerified: false });
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  },

  // Authentication settings
  setBiometricEnabled: async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(AUTH_BIOMETRIC_ENABLED_KEY, String(enabled));
      set({ isBiometricEnabled: enabled });
      return true;
    } catch (error) {
      console.error('Set biometric error:', error);
      return false;
    }
  },
  
  setPinEnabled: async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(AUTH_PIN_ENABLED_KEY, String(enabled));
      set({ isPinEnabled: enabled });
      return true;
    } catch (error) {
      console.error('Set PIN enabled error:', error);
      return false;
    }
  },
  
  setPinCode: async (pinCode: string) => {
    try {
      await AsyncStorage.setItem(AUTH_PIN_CODE_KEY, pinCode);
      set({ pinCode, isPinEnabled: true });
      return true;
    } catch (error) {
      console.error('Set PIN code error:', error);
      return false;
    }
  },
  
  verifyPinCode: (pinCode: string) => {
    return pinCode === get().pinCode;
  },
  
  setOtpEnabled: async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(AUTH_OTP_ENABLED_KEY, String(enabled));
      set({ isOtpEnabled: enabled });
      return true;
    } catch (error) {
      console.error('Set OTP enabled error:', error);
      return false;
    }
  },

  // Logout function
  logout: async () => {
    try {
      // Clear from AsyncStorage
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      await AsyncStorage.setItem(AUTH_STATUS_KEY, 'false');

      // Update state
      set({ 
        user: null, 
        isAuthenticated: false,
        tempEmail: '',
        otpPurpose: '',
        isOtpVerified: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
}));

// Function to initialize auth state from AsyncStorage
export const initializeAuth = async () => {
  try {
    const userJSON = await AsyncStorage.getItem(AUTH_USER_KEY);
    const authStatus = await AsyncStorage.getItem(AUTH_STATUS_KEY);
    const biometricEnabled = await AsyncStorage.getItem(AUTH_BIOMETRIC_ENABLED_KEY);
    const pinEnabled = await AsyncStorage.getItem(AUTH_PIN_ENABLED_KEY);
    const pinCode = await AsyncStorage.getItem(AUTH_PIN_CODE_KEY);
    const otpEnabled = await AsyncStorage.getItem(AUTH_OTP_ENABLED_KEY);
    
    useAuthStore.setState({
      isBiometricEnabled: biometricEnabled === 'true',
      isPinEnabled: pinEnabled === 'true',
      pinCode: pinCode || '',
      isOtpEnabled: otpEnabled === 'true',
    });
    
    if (userJSON && authStatus === 'true') {
      const user = JSON.parse(userJSON);
      useAuthStore.setState({ user, isAuthenticated: true });
    }
  } catch (error) {
    console.error('Initialize auth error:', error);
  }
}; 