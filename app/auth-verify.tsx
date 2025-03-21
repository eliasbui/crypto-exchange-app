import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { getTheme, spacing } from '../constants/theme';
import Text from '../components/ui/Text';
import Card from '../components/ui/Card';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import PinInput from '../components/ui/PinInput';
import OtpInput from '../components/ui/OtpInput';

const PIN_LENGTH = 6;
const OTP_LENGTH = 6;

export default function AuthVerifyScreen() {
  const theme = getTheme(useUIStore((state) => state.theme));
  const { 
    isBiometricEnabled, 
    isPinEnabled, 
    isOtpEnabled,
    verifyPinCode,
    verifyAuth
  } = useAuthStore();
  
  const [verificationMethod, setVerificationMethod] = useState<'biometric' | 'pin' | 'otp'>('biometric');
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthMethod();
  }, []);

  const checkAuthMethod = async () => {
    if (isBiometricEnabled) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (compatible && enrolled) {
        handleBiometricAuth();
        return;
      }
    }
    
    if (isPinEnabled) {
      setVerificationMethod('pin');
    } else if (isOtpEnabled) {
      setVerificationMethod('otp');
      sendOtp(); // Function to send OTP to user's email/phone
    }
  };

  const handleBiometricAuth = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity',
        fallbackLabel: 'Use PIN instead',
        disableDeviceFallback: true,
      });
      
      if (result.success) {
        await verifyAuth();
        router.replace('/(tabs)');
      } else if (isPinEnabled) {
        setVerificationMethod('pin');
      } else if (isOtpEnabled) {
        setVerificationMethod('otp');
        sendOtp();
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      setError('Biometric authentication failed');
      if (isPinEnabled) {
        setVerificationMethod('pin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async () => {
    if (pin.length !== PIN_LENGTH) {
      setError('Please enter a valid PIN');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const isValid = await verifyPinCode(pin);
      if (isValid) {
        await verifyAuth();
        router.replace('/(tabs)');
      } else {
        setError('Invalid PIN. Please try again.');
        setPin('');
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setError('Failed to verify PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter a valid OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Verify OTP with backend
      const isValid = true; // Replace with actual OTP verification
      if (isValid) {
        await verifyAuth();
        router.replace('/(tabs)');
      } else {
        setError('Invalid OTP. Please try again.');
        setOtp('');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    try {
      // Send OTP to user's email/phone
      Alert.alert('OTP Sent', 'Please check your email for the verification code.');
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('Failed to send OTP');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animatable.View 
        animation="fadeInDown" 
        duration={600} 
        style={styles.header}
        useNativeDriver
      >
        <Text variant="h4" weight="bold" style={styles.title}>
          Verify Your Identity
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          {verificationMethod === 'biometric' && 'Use biometric authentication to continue'}
          {verificationMethod === 'pin' && 'Enter your PIN to continue'}
          {verificationMethod === 'otp' && 'Enter the verification code sent to your email'}
        </Text>
      </Animatable.View>

      <Animatable.View 
        animation="fadeIn" 
        delay={300} 
        duration={600}
        style={styles.content}
        useNativeDriver
      >
        {error && (
          <Animatable.View 
            animation="shake" 
            style={[styles.errorContainer, { backgroundColor: theme.danger + '20' }]}
            useNativeDriver
          >
            <Text color="danger" style={styles.errorText}>{error}</Text>
          </Animatable.View>
        )}

        <Card style={styles.verificationCard}>
          {verificationMethod === 'biometric' && (
            <TouchableOpacity
              style={[styles.biometricButton, { backgroundColor: theme.primary + '20' }]}
              onPress={handleBiometricAuth}
              disabled={loading}
            >
              <MaterialCommunityIcons 
                name="fingerprint" 
                size={64} 
                color={theme.primary} 
              />
              <Text variant="body1" style={styles.biometricText}>
                Touch to verify
              </Text>
            </TouchableOpacity>
          )}

          {verificationMethod === 'pin' && (
            <View style={styles.pinContainer}>
              <PinInput
                length={PIN_LENGTH}
                value={pin}
                onChange={setPin}
                onComplete={handlePinSubmit}
                secure
              />
            </View>
          )}

          {verificationMethod === 'otp' && (
            <View style={styles.otpContainer}>
              <OtpInput
                length={OTP_LENGTH}
                value={otp}
                onChange={setOtp}
                onComplete={handleOtpSubmit}
              />
              <TouchableOpacity 
                style={styles.resendButton} 
                onPress={sendOtp}
              >
                <Text color="primary" variant="body2">
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginTop: spacing.xxxl,
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    textAlign: 'center',
  },
  verificationCard: {
    padding: spacing.xl,
  },
  biometricButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: 16,
  },
  biometricText: {
    marginTop: spacing.md,
  },
  pinContainer: {
    alignItems: 'center',
  },
  otpContainer: {
    alignItems: 'center',
  },
  resendButton: {
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 