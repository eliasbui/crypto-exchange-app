import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Redirect, Link } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { getTheme, spacing, radius } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';

export default function RegisterScreen() {
  const theme = getTheme(useUIStore((state) => state.theme));
  const register = useAuthStore((state) => state.register);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Redirect href="/" />;
  }
  
  const handleRegister = async () => {
    // Reset error
    setError('');
    
    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    // Show loading indicator
    setLoading(true);
    
    try {
      // Attempt to register
      const success = await register(username, email, password);
      
      if (!success) {
        setError('Registration failed. Email may already be in use.');
      }
      // If success, the isAuthenticated state will change and trigger a redirect
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text variant="h4" weight="bold" style={styles.title}>Create Account</Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          Join the crypto revolution
        </Text>
      </View>
      
      <View style={styles.form}>
        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: theme.danger + '20' }]}>
            <Text color="danger" style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        
        <View style={styles.inputContainer}>
          <Text variant="body2" weight="semibold" style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="Choose a username"
            placeholderTextColor={theme.secondaryText}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        
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
            placeholder="Create a password"
            placeholderTextColor={theme.secondaryText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text variant="body2" weight="semibold" style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="Confirm your password"
            placeholderTextColor={theme.secondaryText}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        
        <Button
          title={loading ? 'Creating Account...' : 'Create Account'}
          variant="primary"
          onPress={handleRegister}
          disabled={loading}
          style={styles.button}
        />
        
        <View style={styles.loginContainer}>
          <Text variant="body2" color="secondaryText">Already have an account?</Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text variant="body2" color="primary" weight="semibold" style={styles.loginText}>
                Log in
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