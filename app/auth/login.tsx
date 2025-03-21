import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Redirect, Link } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { getTheme, spacing, radius } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';

export default function LoginScreen() {
  const theme = getTheme(useUIStore((state) => state.theme));
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Redirect href="/" />;
  }
  
  const handleLogin = async () => {
    // Reset error
    setError('');
    
    // Validate inputs
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    
    // Show loading indicator
    setLoading(true);
    
    try {
      // Attempt to login
      const success = await login(email, password);
      
      if (!success) {
        setError('Invalid email or password');
      }
      // If success, the isAuthenticated state will change and trigger a redirect
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // For demo purposes, we'll add a shortcut function
  const handleDemoLogin = async () => {
    setEmail('demo@example.com');
    setPassword('password');
    
    // Small delay to show the filled fields
    setTimeout(() => {
      handleLogin();
    }, 300);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text variant="h4" weight="bold" style={styles.title}>Welcome Back</Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          Log in to your crypto account
        </Text>
      </View>
      
      <View style={styles.form}>
        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: theme.danger + '20' }]}>
            <Text color="danger" style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        
        <View style={styles.inputContainer}>
          <Text variant="body2" weight="semibold" style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="Enter your email"
            placeholderTextColor={theme.secondaryText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text variant="body2" weight="semibold" style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="Enter your password"
            placeholderTextColor={theme.secondaryText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.forgotPassword}>
            <Text variant="body2" color="primary">Forgot password?</Text>
          </TouchableOpacity>
        </View>
        
        <Button
          title={loading ? 'Logging in...' : 'Log In'}
          variant="primary"
          onPress={handleLogin}
          disabled={loading}
          style={styles.button}
        />
        
        <Button
          title="Use Demo Account"
          variant="secondary"
          onPress={handleDemoLogin}
          disabled={loading}
          style={styles.demoButton}
        />
        
        <View style={styles.registerContainer}>
          <Text variant="body2" color="secondaryText">Don't have an account?</Text>
          <Link href="/auth/register" asChild>
            <TouchableOpacity>
              <Text variant="body2" color="primary" weight="semibold" style={styles.registerText}>
                Sign up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
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
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.md,
  },
  demoButton: {
    marginTop: spacing.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  registerText: {
    marginLeft: spacing.xs,
  },
}); 