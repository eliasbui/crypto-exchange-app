import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUIStore } from '../../store/uiStore';

// Since we don't have the theme import, let's use the UIStore to get theme
export default function AuthSettings() {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPin, setCurrentPin] = useState('');

  // Use the theme from uiStore instead
  const { theme } = useUIStore();
  const isDarkMode = theme === 'dark';
  const themeColors = {
    primary: '#6357ff',
    secondary: '#32a852',
    background: isDarkMode ? '#121212' : '#f5f5f5',
    card: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    textSecondary: isDarkMode ? '#b0b0b0' : '#757575',
    border: isDarkMode ? '#333333' : '#e0e0e0',
  };

  // Create a local authentication service since we don't have the imported one
  const authService = {
    // Storage keys
    BIOMETRIC_ENABLED_KEY: 'biometric_enabled',
    PIN_CODE_KEY: 'pin_code',

    // Check if biometric is available
    isBiometricAvailable: async (): Promise<boolean> => {
      const available = await LocalAuthentication.hasHardwareAsync();
      return available;
    },

    // Get supported biometric types
    getSupportedBiometricTypes: async (): Promise<LocalAuthentication.AuthenticationType[]> => {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types;
    },

    // Check if biometric is enabled for the user
    isBiometricEnabled: async (): Promise<boolean> => {
      try {
        const value = await AsyncStorage.getItem(authService.BIOMETRIC_ENABLED_KEY);
        return value === 'true';
      } catch (error) {
        console.error('Error reading biometric enabled status:', error);
        return false;
      }
    },

    // Enable or disable biometric authentication
    setBiometricEnabled: async (enabled: boolean): Promise<void> => {
      try {
        await AsyncStorage.setItem(authService.BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
      } catch (error) {
        console.error('Error setting biometric enabled status:', error);
        throw error;
      }
    },

    // Set a PIN code (empty string to remove)
    setPinCode: async (pinCode: string): Promise<void> => {
      try {
        await AsyncStorage.setItem(authService.PIN_CODE_KEY, pinCode);
      } catch (error) {
        console.error('Error setting PIN code:', error);
        throw error;
      }
    },

    // Verify a PIN code
    verifyPinCode: async (pinCode: string): Promise<boolean> => {
      try {
        const storedPin = await AsyncStorage.getItem(authService.PIN_CODE_KEY);
        return storedPin === pinCode;
      } catch (error) {
        console.error('Error verifying PIN code:', error);
        return false;
      }
    },

    // Check if PIN code is set
    isPinCodeSet: async (): Promise<boolean> => {
      try {
        const pinCode = await AsyncStorage.getItem(authService.PIN_CODE_KEY);
        return !!pinCode && pinCode.length > 0;
      } catch (error) {
        console.error('Error checking if PIN code is set:', error);
        return false;
      }
    },

    // Authenticate with biometrics
    authenticateWithBiometrics: async (
      promptMessage: string,
      cancelLabel?: string
    ): Promise<boolean> => {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage,
          cancelLabel,
          disableDeviceFallback: true,
        });
        return result.success;
      } catch (error) {
        console.error('Error authenticating with biometrics:', error);
        return false;
      }
    },

    // Get biometric type name for display
    getBiometricTypeName: (type: LocalAuthentication.AuthenticationType): string => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'Fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'Face ID';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris';
        default:
          return 'Biometric';
      }
    },
  };

  useEffect(() => {
    checkBiometricStatus();
    checkPinStatus();
  }, []);

  const checkBiometricStatus = async () => {
    try {
      const isAvailable = await authService.isBiometricAvailable();
      setIsBiometricAvailable(isAvailable);
      
      if (isAvailable) {
        const types = await authService.getSupportedBiometricTypes();
        if (types.length > 0) {
          setBiometricType(authService.getBiometricTypeName(types[0]));
        }

        const isEnabled = await authService.isBiometricEnabled();
        setIsBiometricEnabled(isEnabled);
      }
    } catch (error) {
      console.error('Error checking biometric status:', error);
    }
  };

  const checkPinStatus = async () => {
    try {
      const hasPinCode = await authService.isPinCodeSet();
      setIsPinSet(hasPinCode);
    } catch (error) {
      console.error('Error checking PIN status:', error);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    try {
      if (value) {
        // Ensure PIN is set before enabling biometrics
        if (!isPinSet) {
          Alert.alert(
            'PIN Required',
            'You need to set a PIN code before enabling biometric authentication.',
            [{ text: 'OK', onPress: () => setShowPinModal(true) }]
          );
          return;
        }

        // Authenticate with biometrics before enabling
        const success = await authService.authenticateWithBiometrics(
          'Enable Biometric Login',
          'Authenticate to enable biometric login'
        );

        if (success) {
          await authService.setBiometricEnabled(true);
          setIsBiometricEnabled(true);
        }
      } else {
        await authService.setBiometricEnabled(false);
        setIsBiometricEnabled(false);
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Alert.alert('Error', 'Failed to update biometric settings.');
    }
  };

  const handleSetPin = async () => {
    if (!isChangingPin && isPinSet) {
      // Verify current PIN before allowing changes
      setIsChangingPin(true);
      return;
    }

    if (isChangingPin && !await authService.verifyPinCode(currentPin)) {
      Alert.alert('Error', 'Current PIN is incorrect.');
      return;
    }

    if (pin.length < 4) {
      Alert.alert('Invalid PIN', 'PIN must be at least 4 digits.');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
      return;
    }

    try {
      await authService.setPinCode(pin);
      setIsPinSet(true);
      setIsChangingPin(false);
      setShowPinModal(false);
      setPin('');
      setConfirmPin('');
      setCurrentPin('');
      Alert.alert('Success', 'PIN has been set successfully.');
    } catch (error) {
      console.error('Error setting PIN:', error);
      Alert.alert('Error', 'Failed to set PIN.');
    }
  };

  const handleRemovePin = async () => {
    try {
      // First verify the current PIN
      if (!isChangingPin) {
        setIsChangingPin(true);
        return;
      }

      if (await authService.verifyPinCode(currentPin)) {
        // If biometric is enabled, disable it first
        if (isBiometricEnabled) {
          await authService.setBiometricEnabled(false);
          setIsBiometricEnabled(false);
        }

        // Remove the PIN
        await authService.setPinCode('');
        setIsPinSet(false);
        setIsChangingPin(false);
        setCurrentPin('');
        Alert.alert('Success', 'PIN has been removed.');
      } else {
        Alert.alert('Error', 'Current PIN is incorrect.');
      }
    } catch (error) {
      console.error('Error removing PIN:', error);
      Alert.alert('Error', 'Failed to remove PIN.');
    }
  };

  // Custom header component instead of LinearGradient
  const Header = () => (
    <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
      <Text style={styles.headerTitle}>Authentication Settings</Text>
      <Text style={styles.headerSubtitle}>Manage your authentication methods</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          title: 'Authentication Settings',
          headerStyle: {
            backgroundColor: themeColors.primary,
          },
          headerTintColor: '#fff',
        }}
      />

      <Header />

      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>PIN Code</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              if (isPinSet) {
                Alert.alert(
                  'Change PIN',
                  'Do you want to change your PIN?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Change', onPress: () => {
                      setIsChangingPin(false);
                      setShowPinModal(true);
                    }},
                    { text: 'Remove', onPress: () => handleRemovePin() }
                  ]
                );
              } else {
                setIsChangingPin(false);
                setShowPinModal(true);
              }
            }}
          >
            <View style={styles.settingItemLeft}>
              <MaterialIcons name="pin" size={24} color={themeColors.text} />
              <Text style={[styles.settingItemText, { color: themeColors.text }]}>
                {isPinSet ? 'Change PIN Code' : 'Set PIN Code'}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={themeColors.text} />
          </TouchableOpacity>

          <View style={styles.settingItemInfo}>
            <Text style={[styles.settingItemInfoText, { color: themeColors.textSecondary }]}>
              {isPinSet 
                ? 'Your PIN code is set. You can change or remove it.' 
                : 'Set a PIN code to secure your account.'}
            </Text>
          </View>
        </View>

        {isBiometricAvailable && (
          <View style={[styles.section, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Biometric Authentication</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <MaterialIcons name="fingerprint" size={24} color={themeColors.text} />
                <Text style={[styles.settingItemText, { color: themeColors.text }]}>
                  {`Enable ${biometricType}`}
                </Text>
              </View>
              <Switch
                value={isBiometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: '#767577', true: themeColors.primary }}
                thumbColor={'#f4f3f4'}
                disabled={!isPinSet}
              />
            </View>

            <View style={styles.settingItemInfo}>
              <Text style={[styles.settingItemInfoText, { color: themeColors.textSecondary }]}>
                {isPinSet 
                  ? `Use ${biometricType} for quick and secure authentication.` 
                  : `You need to set a PIN code before enabling ${biometricType}.`}
              </Text>
            </View>
          </View>
        )}

        {!isBiometricAvailable && (
          <View style={[styles.section, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Biometric Authentication</Text>
            <View style={styles.settingItem}>
              <Text style={[styles.settingItemText, { color: themeColors.textSecondary }]}>
                Biometric authentication is not available on this device.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* PIN Code Modal */}
      <Modal
        visible={showPinModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              {isPinSet ? 'Change PIN Code' : 'Set PIN Code'}
            </Text>

            {isChangingPin && isPinSet && (
              <>
                <Text style={[styles.modalLabel, { color: themeColors.textSecondary }]}>Enter current PIN</Text>
                <TextInput
                  style={[styles.pinInput, { borderColor: themeColors.border, color: themeColors.text }]}
                  value={currentPin}
                  onChangeText={setCurrentPin}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={6}
                  placeholder="Current PIN"
                  placeholderTextColor={themeColors.textSecondary}
                />
              </>
            )}

            {(!isChangingPin || !isPinSet) && (
              <>
                <Text style={[styles.modalLabel, { color: themeColors.textSecondary }]}>Enter new PIN (4-6 digits)</Text>
                <TextInput
                  style={[styles.pinInput, { borderColor: themeColors.border, color: themeColors.text }]}
                  value={pin}
                  onChangeText={setPin}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={6}
                  placeholder="New PIN"
                  placeholderTextColor={themeColors.textSecondary}
                />

                <Text style={[styles.modalLabel, { color: themeColors.textSecondary }]}>Confirm new PIN</Text>
                <TextInput
                  style={[styles.pinInput, { borderColor: themeColors.border, color: themeColors.text }]}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={6}
                  placeholder="Confirm PIN"
                  placeholderTextColor={themeColors.textSecondary}
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => {
                  setShowPinModal(false);
                  setPin('');
                  setConfirmPin('');
                  setCurrentPin('');
                  setIsChangingPin(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.primary }]}
                onPress={handleSetPin}
              >
                <Text style={styles.modalButtonText}>
                  {isChangingPin && isPinSet ? 'Verify & Continue' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingItemInfo: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  settingItemInfoText: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  pinInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 