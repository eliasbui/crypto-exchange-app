import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { getTheme, spacing, radius } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  const setTempEmail = useAuthStore((state) => state.setTempEmail);
  const setOtpPurpose = useAuthStore((state) => state.setOtpPurpose);
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  
  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };
  
  const handleChangeEmail = (text: string) => {
    setEmail(text);
    setIsValid(validateEmail(text));
    if (error) setError('');
  };
  
  const handleRequestOTP = async () => {
    if (!isValid) {
      setError('Please enter a valid email address');
      return;
    }
    
    Keyboard.dismiss();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Store email and purpose in auth store
      setTempEmail(email);
      setOtpPurpose('reset-password');
      // Navigate to OTP verification screen
      router.push('/auth/otp-verification');
    }, 1500);
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
          Reset Password
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          Enter your email to receive a one-time password
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
        ) : null}
        
        <View style={styles.inputContainer}>
          <Text variant="body2" weight="semibold" style={styles.label}>
            Email Address
          </Text>
          <View style={[
            styles.inputWrapper, 
            { 
              backgroundColor: theme.card,
              borderColor: error ? theme.danger : isValid && email ? theme.success : theme.border 
            }
          ]}>
            <MaterialCommunityIcons 
              name="email-outline" 
              size={20} 
              color={theme.secondaryText} 
            />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter your email"
              placeholderTextColor={theme.secondaryText}
              value={email}
              onChangeText={handleChangeEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isValid && email ? (
              <Animatable.View animation="bounceIn" useNativeDriver>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={20} 
                  color={theme.success} 
                />
              </Animatable.View>
            ) : null}
          </View>
        </View>
        
        <Animatable.View 
          animation="fadeInUp" 
          delay={600} 
          duration={600}
          useNativeDriver
        >
          <Button
            title={loading ? 'Sending OTP...' : 'Send OTP'}
            variant="primary"
            onPress={handleRequestOTP}
            disabled={loading || !isValid}
            style={styles.button}
          />
          
          <View style={styles.loginContainer}>
            <Text variant="body2" color="secondaryText">
              Remember your password?
            </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text 
                  variant="body2" 
                  color="primary" 
                  weight="semibold" 
                  style={styles.loginText}
                >
                  Log in
                </Text>
              </TouchableOpacity>
            </Link>
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
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 16,
  },
  button: {
    marginTop: spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    marginLeft: spacing.xs,
  },
}); 