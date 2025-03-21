import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

// Storage keys
const PIN_CODE_KEY = '@crypto_exchange_pin_code';
const BIOMETRICS_ENABLED_KEY = '@crypto_exchange_biometrics_enabled';

/**
 * Service for handling secure authentication (biometrics and PIN)
 */
export const AuthenticationService = {
  /**
   * Check if the device supports biometric authentication
   */
  isBiometricAvailable: async (): Promise<boolean> => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    return compatible;
  },

  /**
   * Get enrolled biometric types (fingerprint, facial recognition, etc.)
   */
  getSupportedBiometricTypes: async (): Promise<LocalAuthentication.AuthenticationType[]> => {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return types;
  },

  /**
   * Check if biometric authentication is enabled
   */
  isBiometricEnabled: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(BIOMETRICS_ENABLED_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  },

  /**
   * Enable/disable biometric authentication
   */
  setBiometricEnabled: async (enabled: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem(BIOMETRICS_ENABLED_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      console.error('Error setting biometric status:', error);
    }
  },

  /**
   * Set a PIN code
   */
  setPinCode: async (pinCode: string): Promise<boolean> => {
    try {
      // In a real app, you would want to hash this PIN before storing it
      await AsyncStorage.setItem(PIN_CODE_KEY, pinCode);
      return true;
    } catch (error) {
      console.error('Error setting PIN code:', error);
      return false;
    }
  },

  /**
   * Verify a PIN code
   */
  verifyPinCode: async (pinCode: string): Promise<boolean> => {
    try {
      const storedPinCode = await AsyncStorage.getItem(PIN_CODE_KEY);
      return storedPinCode === pinCode;
    } catch (error) {
      console.error('Error verifying PIN code:', error);
      return false;
    }
  },

  /**
   * Check if a PIN code is set
   */
  isPinCodeSet: async (): Promise<boolean> => {
    try {
      const pinCode = await AsyncStorage.getItem(PIN_CODE_KEY);
      return !!pinCode;
    } catch (error) {
      console.error('Error checking PIN code:', error);
      return false;
    }
  },

  /**
   * Authenticate using biometrics
   */
  authenticateWithBiometrics: async (): Promise<boolean> => {
    try {
      const biometricsEnabled = await AuthenticationService.isBiometricEnabled();
      if (!biometricsEnabled) return false;

      const isBiometricAvailable = await AuthenticationService.isBiometricAvailable();
      if (!isBiometricAvailable) return false;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your wallet',
        fallbackLabel: 'Use PIN code',
        disableDeviceFallback: false, // Allow fallback to device PIN/passcode
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  },

  /**
   * Determine the biometric type name for display
   */
  getBiometricTypeName: async (): Promise<string> => {
    try {
      const types = await AuthenticationService.getSupportedBiometricTypes();
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris';
      }
      
      return 'Biometric';
    } catch (error) {
      console.error('Error getting biometric type name:', error);
      return 'Biometric';
    }
  },

  /**
   * Secure authentication - tries biometrics first, then falls back to PIN
   */
  authenticate: async (): Promise<boolean> => {
    // First try biometric authentication if enabled
    const biometricsEnabled = await AuthenticationService.isBiometricEnabled();
    if (biometricsEnabled) {
      const biometricResult = await AuthenticationService.authenticateWithBiometrics();
      if (biometricResult) return true;
    }
    
    // If biometrics failed or not enabled, fall back to PIN code
    const pinCodeSet = await AuthenticationService.isPinCodeSet();
    if (pinCodeSet) {
      // In a real app, you would show a PIN code entry UI here
      // For demo purposes, we'll use a simple prompt
      return new Promise((resolve) => {
        Alert.prompt(
          'Enter PIN Code',
          'Please enter your PIN code to continue',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'OK',
              onPress: async (pin) => {
                if (!pin) {
                  resolve(false);
                  return;
                }
                const result = await AuthenticationService.verifyPinCode(pin);
                resolve(result);
              },
            },
          ],
          'secure-text'
        );
      });
    }
    
    return false;
  },
}; 