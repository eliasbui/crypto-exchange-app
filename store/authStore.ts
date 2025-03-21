import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';
import { user as mockUser } from '../data/mockData';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

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
  isLoading: false,
  error: null,
  emailVerificationEnabled: true,
  requireAuth: false,
  
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

  // Login function
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, any email/password combination works
      const user = {
        ...mockUser,
        email
      };
      
      // Save to storage
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(AUTH_STATUS_KEY, 'true');
      
      // Check if additional verification is needed
      const biometricEnabled = await AsyncStorage.getItem(AUTH_BIOMETRIC_ENABLED_KEY) === 'true';
      const pinEnabled = await AsyncStorage.getItem(AUTH_PIN_ENABLED_KEY) === 'true';
      const otpEnabled = await AsyncStorage.getItem(AUTH_OTP_ENABLED_KEY) === 'true';
      
      // Update state
      set({ 
        user,
        isAuthenticated: true,
        isBiometricEnabled: biometricEnabled,
        isPinEnabled: pinEnabled,
        isOtpEnabled: otpEnabled,
        requireAuth: true // Require additional verification
      });
      
      return true;
    } catch (error) {
      set({ error: 'Login failed. Please try again.' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Verify authentication (biometric/PIN/OTP)
  verifyAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // After successful verification
      set({ requireAuth: false });
      return true;
    } catch (error) {
      set({ error: 'Verification failed. Please try again.' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Register function - simulate API call with delay
  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
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

      // Store auth token securely
      await SecureStore.setItemAsync('authToken', 'mock-token');

      // Update state
      set({ user: newUser, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Register error:', error);
      set({ 
        error: 'Failed to register. Please try again.',
        isLoading: false 
      });
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
      set({ isLoading: true, error: null });
      
      // Get the temp email from storage
      const tempEmail = await SecureStore.getItemAsync('temp_email');
      if (!tempEmail) {
        throw new Error('No email found for password reset');
      }

      // Call API to reset password
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: tempEmail,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      // Clear temp email from storage
      await SecureStore.deleteItemAsync('temp_email');
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to reset password' 
      });
      return false;
    }
  },

  // Set PIN code
  setPinCode: async (pin: string) => {
    try {
      await SecureStore.setItemAsync(AUTH_PIN_CODE_KEY, pin);
      await AsyncStorage.setItem(AUTH_PIN_ENABLED_KEY, 'true');
      set({ pinCode: pin, isPinEnabled: true });
      return true;
    } catch (error) {
      console.error('Set PIN code error:', error);
      return false;
    }
  },

  // Verify PIN code
  verifyPinCode: async (pin: string) => {
    try {
      const storedPin = await SecureStore.getItemAsync(AUTH_PIN_CODE_KEY);
      return storedPin === pin;
    } catch (error) {
      console.error('Verify PIN code error:', error);
      return false;
    }
  },

  // Enable/disable biometric authentication
  setBiometricEnabled: async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(AUTH_BIOMETRIC_ENABLED_KEY, String(enabled));
      await SecureStore.setItemAsync('biometricEnabled', enabled.toString());
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
    set({ isLoading: true });
    try {
      // Clear from AsyncStorage
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      await AsyncStorage.setItem(AUTH_STATUS_KEY, 'false');

      // Clear secure storage
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('pinCode');

      // Update state
      set({ 
        user: null, 
        isAuthenticated: false,
        tempEmail: '',
        otpPurpose: '',
        isOtpVerified: false,
        isBiometricEnabled: false,
        isPinEnabled: false,
        isOtpEnabled: false,
        pinCode: '',
        emailVerificationEnabled: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ 
        error: 'Failed to logout. Please try again.',
        isLoading: false 
      });
    }
  },

  // Update password function
  updatePassword: async (currentPassword: string, newPassword: string) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, this would verify the current password with the backend
      // and update the password if verification is successful
      // For demo purposes, we'll just return success
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      return false;
    }
  },

  updateUser: async (user: User) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, make API call to update user
      set({ 
        user,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: 'Failed to update user. Please try again.',
        isLoading: false 
      });
      throw error;
    }
  },

  setEmailVerificationEnabled: async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(AUTH_PIN_ENABLED_KEY, String(enabled));
      set({ emailVerificationEnabled: enabled });
      return true;
    } catch (error) {
      throw new Error('Failed to update email verification settings');
    }
  },

  sendEmailOTP: async () => {
    const { user } = get();
    if (!user?.email) {
      throw new Error('No email address found');
    }

    try {
      // In a real app, make API call to send OTP
      // For demo, we'll simulate sending OTP
      console.log('Sending OTP to:', user.email);
    } catch (error) {
      throw new Error('Failed to send verification code');
    }
  },

  verifyEmailOTP: async (code: string) => {
    try {
      // In a real app, make API call to verify OTP
      // For demo, we'll accept any 6-digit code
      return code.length === 6;
    } catch (error) {
      throw new Error('Failed to verify code');
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