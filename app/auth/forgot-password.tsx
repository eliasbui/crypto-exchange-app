import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { getTheme, spacing, radius } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { router, useRootNavigationState } from 'expo-router';
import * as Animatable from 'react-native-animatable';

export default function ForgotPasswordScreen() {
  const navigationState = useRootNavigationState();
  const theme = getTheme(useUIStore((state) => state.theme));
  const { setTempEmail, setOtpPurpose } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Store email and purpose for OTP verification
      setTempEmail(email);
      setOtpPurpose('reset-password');
      
      // Only navigate when navigation is ready
      if (navigationState?.key) {
        router.replace('/auth/verify-otp');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Failed to process request. Please try again.');
    } finally {
      setLoading(false);
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
          Forgot Password
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          Enter your email address to receive a verification code
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
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons 
              name="email-outline" 
              size={24} 
              color={theme.secondaryText} 
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Email address"
              placeholderTextColor={theme.secondaryText}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <Button
            title="Send Verification Code"
            onPress={handleSubmit}
            loading={loading}
            style={styles.button}
          />
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  button: {
    marginTop: spacing.md,
  },
}); 