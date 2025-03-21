import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { getTheme, spacing, radius } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import OtpInput from '../../components/ui/OtpInput';

const OTP_LENGTH = 6;
const RESEND_DELAY = 30; // seconds

export default function VerifyOtpScreen() {
  const theme = getTheme(useUIStore((state) => state.theme));
  const { 
    tempEmail,
    otpPurpose,
    verifyOTP,
    resetOtpVerification,
    sendEmailOTP
  } = useAuthStore();
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    // Send OTP when screen mounts
    handleSendOTP();
    
    return () => {
      // Reset OTP verification status when unmounting
      resetOtpVerification();
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendTimer]);

  const handleSendOTP = async () => {
    try {
      await sendEmailOTP();
      setResendTimer(RESEND_DELAY);
      Alert.alert(
        'OTP Sent',
        `A verification code has been sent to ${tempEmail}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('Failed to send verification code');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter a valid verification code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const isValid = await verifyOTP(otp);
      if (isValid) {
        if (otpPurpose === 'register') {
          router.replace('/auth/complete-registration' as any);
        } else if (otpPurpose === 'reset-password') {
          router.replace('/auth/reset-password' as any);
        }
      } else {
        setError('Invalid verification code');
        setOtp('');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (resendTimer === 0) {
      handleSendOTP();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <MaterialCommunityIcons 
          name="arrow-left" 
          size={24} 
          color={theme.text} 
        />
      </TouchableOpacity>

      <Animatable.View 
        animation="fadeInDown" 
        duration={600} 
        style={styles.header}
        useNativeDriver
      >
        <Text variant="h4" weight="bold" style={styles.title}>
          Verify Your Email
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          Enter the 6-digit code sent to {tempEmail}
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

        <View style={styles.form}>
          <OtpInput
            length={OTP_LENGTH}
            value={otp}
            onChange={setOtp}
            onComplete={handleVerifyOTP}
          />

          <Button
            title="Verify"
            onPress={handleVerifyOTP}
            loading={loading}
            style={styles.button}
          />

          <TouchableOpacity 
            style={styles.resendButton} 
            onPress={handleResendOTP}
            disabled={resendTimer > 0}
          >
            <Text 
              color={resendTimer > 0 ? 'secondaryText' : 'primary'} 
              variant="body2"
              style={styles.resendText}
            >
              {resendTimer > 0 
                ? `Resend code in ${resendTimer}s` 
                : 'Resend code'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  backButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    textAlign: 'center',
  },
  form: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  button: {
    marginTop: spacing.xl,
    width: '100%',
  },
  resendButton: {
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  resendText: {
    textAlign: 'center',
  },
}); 