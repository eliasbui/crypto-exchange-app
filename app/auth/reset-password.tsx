import React, { useState } from 'react';
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  
  const { resetPassword, isOtpVerified, tempEmail } = useAuthStore();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-3: weak, medium, strong, very strong
  
  // Check if we've verified the OTP for this reset
  if (!isOtpVerified) {
    // If not verified, redirect back to forgot password
    router.replace('/auth/forgot-password');
    return null;
  }
  
  // Calculate password strength
  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    // Length check
    if (pass.length >= 8) score += 1;
    // Complexity checks
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    setPasswordStrength(Math.min(score, 3));
  };
  
  const handleChangePassword = (text: string) => {
    setPassword(text);
    checkPasswordStrength(text);
    if (error) setError('');
  };
  
  const handleChangeConfirmPassword = (text: string) => {
    setConfirmPassword(text);
    if (error) setError('');
  };
  
  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 0: return 'Weak';
      case 1: return 'Medium';
      case 2: return 'Strong';
      case 3: return 'Very Strong';
      default: return '';
    }
  };
  
  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return theme.danger;
      case 1: return theme.warning;
      case 2: return theme.success;
      case 3: return theme.success;
      default: return theme.secondaryText;
    }
  };
  
  const handleResetPassword = async () => {
    Keyboard.dismiss();
    
    // Validate passwords
    if (!password || !confirmPassword) {
      setError('Please enter both passwords');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordStrength < 1) {
      setError('Please choose a stronger password');
      return;
    }
    
    setLoading(true);
    
    try {
      // Attempt to reset password
      const success = await resetPassword(password);
      
      if (success) {
        // Navigate to login page on success
        router.replace('/auth/login');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <Text variant="h4" weight="bold" style={styles.title}>
          Create New Password
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          Enter a new password for {tempEmail}
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
            New Password
          </Text>
          <View style={[
            styles.inputWrapper, 
            { 
              backgroundColor: theme.card,
              borderColor: error ? theme.danger : theme.border 
            }
          ]}>
            <MaterialCommunityIcons 
              name="lock-outline" 
              size={20} 
              color={theme.secondaryText} 
            />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter new password"
              placeholderTextColor={theme.secondaryText}
              value={password}
              onChangeText={handleChangePassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={theme.secondaryText} 
              />
            </TouchableOpacity>
          </View>
          
          {password ? (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBars}>
                <View 
                  style={[
                    styles.strengthBar, 
                    { 
                      backgroundColor: passwordStrength >= 1 ? getStrengthColor() : theme.border,
                      width: '25%' 
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.strengthBar, 
                    { 
                      backgroundColor: passwordStrength >= 2 ? getStrengthColor() : theme.border,
                      width: '25%' 
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.strengthBar, 
                    { 
                      backgroundColor: passwordStrength >= 3 ? getStrengthColor() : theme.border,
                      width: '25%' 
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.strengthBar, 
                    { 
                      backgroundColor: passwordStrength >= 4 ? getStrengthColor() : theme.border,
                      width: '25%' 
                    }
                  ]} 
                />
              </View>
              <Text 
                variant="caption" 
                style={{ color: getStrengthColor() }}
              >
                {getStrengthLabel()}
              </Text>
            </View>
          ) : null}
        </View>
        
        <View style={styles.inputContainer}>
          <Text variant="body2" weight="semibold" style={styles.label}>
            Confirm Password
          </Text>
          <View style={[
            styles.inputWrapper, 
            { 
              backgroundColor: theme.card,
              borderColor: error ? theme.danger : theme.border 
            }
          ]}>
            <MaterialCommunityIcons 
              name="lock-outline" 
              size={20} 
              color={theme.secondaryText} 
            />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Confirm new password"
              placeholderTextColor={theme.secondaryText}
              value={confirmPassword}
              onChangeText={handleChangeConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <MaterialCommunityIcons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={theme.secondaryText} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <Animatable.View 
          animation="fadeInUp" 
          delay={600} 
          duration={600}
          useNativeDriver
        >
          <Button
            title={loading ? 'Updating Password...' : 'Reset Password'}
            variant="primary"
            onPress={handleResetPassword}
            disabled={loading || !password || !confirmPassword}
            style={styles.button}
          />
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
  strengthContainer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strengthBars: {
    flexDirection: 'row',
    flex: 1,
    marginRight: spacing.sm,
    height: 4,
  },
  strengthBar: {
    height: '100%',
    marginRight: 2,
  },
  button: {
    marginTop: spacing.lg,
  },
}); 