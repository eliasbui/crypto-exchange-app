import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { getTheme, spacing, radius } from '../../../constants/theme';
import Text from '../../../components/ui/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';

export default function AuthSettingsScreen() {
  const router = useRouter();
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  
  const { 
    isPinEnabled, 
    isBiometricEnabled, 
    isOtpEnabled,
    setPinEnabled,
    setBiometricEnabled,
    setOtpEnabled,
    setPinCode,
  } = useAuthStore();
  
  const [hasBiometricHardware, setHasBiometricHardware] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState({
    pin: false,
    biometric: false,
    otp: false,
  });
  
  // Check biometric capabilities on mount
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const supported = await LocalAuthentication.hasHardwareAsync();
        setHasBiometricHardware(supported);
        
        if (supported) {
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          const typeNames = [];
          
          if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            typeNames.push('fingerprint');
          }
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            typeNames.push('facial');
          }
          if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            typeNames.push('iris');
          }
          
          setBiometricTypes(typeNames);
        }
      } catch (err) {
        console.error('Error checking biometric hardware:', err);
      }
    };
    
    checkBiometrics();
  }, []);
  
  // Handle PIN toggle
  const handleTogglePin = async (value: boolean) => {
    setLoading(prev => ({ ...prev, pin: true }));
    
    try {
      if (value) {
        // If enabling PIN, navigate to setup screen
        router.push('/settings/set-pin');
      } else {
        // If disabling PIN, confirm and then disable
        await setPinEnabled(false);
        
        // If biometric is enabled and PIN is required, also disable biometric
        if (isBiometricEnabled) {
          Alert.alert(
            'Biometric Authentication',
            'Disabling PIN will also disable biometric authentication as it requires PIN as a fallback.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => setPinEnabled(true) },
              { text: 'Disable Both', style: 'destructive', onPress: async () => {
                await setBiometricEnabled(false);
              }}
            ]
          );
        }
      }
    } catch (err) {
      console.error('Error toggling PIN:', err);
    } finally {
      setLoading(prev => ({ ...prev, pin: false }));
    }
  };
  
  // Handle biometric toggle
  const handleToggleBiometric = async (value: boolean) => {
    setLoading(prev => ({ ...prev, biometric: true }));
    
    try {
      // Check if PIN is enabled, which is required for biometric
      if (value && !isPinEnabled) {
        Alert.alert(
          'PIN Required',
          'You need to set up a PIN first as a fallback for biometric authentication.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Set up PIN', onPress: () => router.push('/settings/set-pin') }
          ]
        );
        return;
      }
      
      // If enabling biometric, authenticate first
      if (value) {
        const results = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable biometric login',
          fallbackLabel: 'Use PIN',
          disableDeviceFallback: false,
        });
        
        if (results.success) {
          await setBiometricEnabled(true);
        }
      } else {
        // Disabling doesn't require authentication
        await setBiometricEnabled(false);
      }
    } catch (err) {
      console.error('Error toggling biometric:', err);
    } finally {
      setLoading(prev => ({ ...prev, biometric: false }));
    }
  };
  
  // Handle OTP toggle
  const handleToggleOtp = async (value: boolean) => {
    setLoading(prev => ({ ...prev, otp: true }));
    
    try {
      await setOtpEnabled(value);
    } catch (err) {
      console.error('Error toggling OTP:', err);
    } finally {
      setLoading(prev => ({ ...prev, otp: false }));
    }
  };
  
  // Get biometric type description
  const getBiometricDescription = () => {
    if (biometricTypes.includes('facial')) {
      return 'Face ID';
    } else if (biometricTypes.includes('fingerprint')) {
      return 'Fingerprint';
    } else if (biometricTypes.includes('iris')) {
      return 'Iris Scan';
    }
    return 'Biometric';
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text variant="h4" weight="bold" style={styles.title}>
          Authentication Settings
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          Configure how you sign in to your account
        </Text>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push('/settings/set-pin')}
        >
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <MaterialCommunityIcons name="pin" color={theme.primary} size={24} />
            </View>
            <View style={styles.settingInfo}>
              <Text variant="body1" weight="semibold">PIN Code</Text>
              <Text variant="body2" color="secondaryText">
                {isPinEnabled ? 'Change your PIN code' : 'Set up a PIN for secure access'}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons 
            name="chevron-right" 
            color={theme.secondaryText} 
            size={24} 
          />
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <MaterialCommunityIcons name="lock-outline" color={theme.primary} size={24} />
            </View>
            <View style={styles.settingInfo}>
              <Text variant="body1" weight="semibold">Require PIN</Text>
              <Text variant="body2" color="secondaryText">
                Use PIN authentication when opening the app
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: theme.border, true: theme.primary + '80' }}
            thumbColor={isPinEnabled ? theme.primary : theme.secondaryText}
            ios_backgroundColor={theme.border}
            onValueChange={handleTogglePin}
            value={isPinEnabled}
            disabled={loading.pin}
          />
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <MaterialCommunityIcons 
                name={biometricTypes.includes('facial') ? 'face-recognition' : 'fingerprint'} 
                color={theme.primary} 
                size={24} 
              />
            </View>
            <View style={styles.settingInfo}>
              <Text variant="body1" weight="semibold">{getBiometricDescription()}</Text>
              <Text variant="body2" color="secondaryText">
                {hasBiometricHardware 
                  ? `Sign in with ${getBiometricDescription()} when available` 
                  : 'Your device does not support biometric authentication'}
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: theme.border, true: theme.primary + '80' }}
            thumbColor={isBiometricEnabled ? theme.primary : theme.secondaryText}
            ios_backgroundColor={theme.border}
            onValueChange={handleToggleBiometric}
            value={isBiometricEnabled}
            disabled={!hasBiometricHardware || loading.biometric || !isPinEnabled}
          />
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <MaterialCommunityIcons name="cellphone-message" color={theme.primary} size={24} />
            </View>
            <View style={styles.settingInfo}>
              <Text variant="body1" weight="semibold">Two-Factor Authentication</Text>
              <Text variant="body2" color="secondaryText">
                Verify your identity with an OTP code sent to your email
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: theme.border, true: theme.primary + '80' }}
            thumbColor={isOtpEnabled ? theme.primary : theme.secondaryText}
            ios_backgroundColor={theme.border}
            onValueChange={handleToggleOtp}
            value={isOtpEnabled}
            disabled={loading.otp}
          />
        </View>
      </View>
      
      <Text variant="caption" color="secondaryText" style={styles.disclaimer}>
        These security measures help protect your account and crypto assets from unauthorized access.
        For additional security, we recommend enabling all authentication methods.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  section: {
    borderRadius: radius.md,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
  disclaimer: {
    padding: spacing.lg,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
}); 