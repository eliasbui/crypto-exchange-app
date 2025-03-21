import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { getTheme, spacing, radius } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const OTP_LENGTH = 6;

export default function OTPVerificationScreen() {
  const router = useRouter();
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  
  const { 
    tempEmail, 
    otpPurpose, 
    verifyOTP,
    completeLogin,
    completeRegistration,
  } = useAuthStore();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes countdown
  
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  // Focus the first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle input change for each OTP digit
  const handleChangeOTP = (text: string, index: number) => {
    if (error) setError('');
    
    // Only allow digits
    if (!/^\d*$/.test(text)) return;
    
    const newOtp = [...otp];
    newOtp[index] = text.slice(0, 1); // Take only the first character
    setOtp(newOtp);
    
    // Auto-advance to next input
    if (text && index < OTP_LENGTH - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all digits are filled
    if (index === OTP_LENGTH - 1 && text) {
      const otpFilled = newOtp.every(digit => digit !== '');
      if (otpFilled) {
        handleVerifyOTP(newOtp);
      }
    }
  };
  
  // Handle backspace key
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !otp[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  // Verify OTP
  const handleVerifyOTP = async (otpArray = otp) => {
    Keyboard.dismiss();
    
    // Validate that all digits are filled
    if (otpArray.some(digit => !digit)) {
      setError('Please enter all digits of the OTP');
      return;
    }
    
    setLoading(true);
    
    // Combine OTP digits into a single string
    const otpString = otpArray.join('');
    
    try {
      // Attempt to verify OTP
      const success = await verifyOTP(otpString);
      
      if (!success) {
        setError('Invalid OTP. Please try again.');
        setLoading(false);
        return;
      }
      
      // Handle different post-verification flows based on the purpose
      if (otpPurpose === 'login') {
        await completeLogin();
        router.replace('/');
      } else if (otpPurpose === 'register') {
        await completeRegistration('User'); // Username would normally come from a previous screen
        router.replace('/');
      } else if (otpPurpose === 'reset-password') {
        router.push('/auth/reset-password');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Request a new OTP
  const handleResendOTP = () => {
    // Reset the timer
    setTimeLeft(120);
    
    // In a real app, this would call an API to resend the OTP
    // For demo, we'll just show a message
    setError('');
    
    // Flash message
    setResendMessage('A new OTP has been sent to your email');
    setTimeout(() => setResendMessage(''), 3000);
  };
  
  const [resendMessage, setResendMessage] = useState('');
  
  // Get title and subtitle based on purpose
  const getTitle = () => {
    switch (otpPurpose) {
      case 'login':
        return 'Verify Login';
      case 'register':
        return 'Verify Registration';
      case 'reset-password':
        return 'Verify Email';
      default:
        return 'OTP Verification';
    }
  };
  
  const getSubtitle = () => {
    return `Enter the 6-digit code sent to ${tempEmail || 'your email'}`;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />
      
      <Animatable.View 
        animation="fadeInDown" 
        duration={600} 
        style={styles.header}
        useNativeDriver
      >
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
        <Text variant="h4" weight="bold" style={styles.title}>
          {getTitle()}
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          {getSubtitle()}
        </Text>
      </Animatable.View>
      
      <Animatable.View 
        animation="fadeIn" 
        delay={300} 
        duration={600}
        style={styles.form}
        useNativeDriver
      >
        {error ? (
          <Animatable.View 
            animation="shake" 
            style={[styles.errorContainer, { backgroundColor: theme.danger + '20' }]}
            useNativeDriver
          >
            <Text color="danger" style={styles.errorText}>{error}</Text>
          </Animatable.View>
        ) : resendMessage ? (
          <Animatable.View 
            animation="fadeIn" 
            style={[styles.messageContainer, { backgroundColor: theme.success + '20' }]}
            useNativeDriver
          >
            <Text color="success" style={styles.messageText}>{resendMessage}</Text>
          </Animatable.View>
        ) : null}
        
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput, 
                { 
                  backgroundColor: theme.card,
                  borderColor: error ? theme.danger : theme.border,
                  color: theme.text 
                }
              ]}
              value={digit}
              onChangeText={(text) => handleChangeOTP(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>
        
        <Animatable.View 
          animation="fadeInUp" 
          delay={600} 
          duration={600}
          useNativeDriver
        >
          <Button
            title={loading ? 'Verifying...' : 'Verify OTP'}
            variant="primary"
            onPress={() => handleVerifyOTP()}
            disabled={loading || otp.some(digit => !digit)}
            style={styles.button}
          />
          
          <View style={styles.resendContainer}>
            <Text variant="body2" color="secondaryText">
              Didn't receive the code?
            </Text>
            {timeLeft > 0 ? (
              <Text 
                variant="body2" 
                color="secondaryText"
                style={styles.timerText}
              >
                Resend in {formatTime(timeLeft)}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP}>
                <Text 
                  variant="body2" 
                  color="primary" 
                  weight="semibold" 
                  style={styles.resendText}
                >
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animatable.View>
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
  backButton: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.md,
  },
  form: {
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
  messageContainer: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  messageText: {
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.lg,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderRadius: radius.sm,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    marginTop: spacing.lg,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  timerText: {
    marginTop: spacing.xs,
  },
  resendText: {
    marginTop: spacing.xs,
  },
}); 