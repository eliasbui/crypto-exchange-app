import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';

import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { getTheme, spacing, radius } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  const { updatePassword } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return '';
  };

  const handleChangePassword = async () => {
    setError('');
    
    // Validate current password
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // In a real app, we would verify the current password with the backend
      // and update the password if verification is successful
      await updatePassword(currentPassword, newPassword);
      router.back();
    } catch (err) {
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text variant="h4" weight="semibold">Change Password</Text>
      </View>

      <Card style={styles.formCard}>
        <View style={styles.formGroup}>
          <Text variant="body2" color="secondaryText">Current Password</Text>
          <View style={[styles.inputContainer, { borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={theme.secondaryText}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeIcon}
            >
              <MaterialCommunityIcons
                name={showCurrentPassword ? 'eye-off' : 'eye'}
                size={24}
                color={theme.secondaryText}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text variant="body2" color="secondaryText">New Password</Text>
          <View style={[styles.inputContainer, { borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={theme.secondaryText}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <MaterialCommunityIcons
                name={showNewPassword ? 'eye-off' : 'eye'}
                size={24}
                color={theme.secondaryText}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text variant="body2" color="secondaryText">Confirm New Password</Text>
          <View style={[styles.inputContainer, { borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={theme.secondaryText}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <MaterialCommunityIcons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={24}
                color={theme.secondaryText}
              />
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <Animatable.View
            animation="shake"
            duration={500}
            style={[styles.errorContainer, { backgroundColor: theme.danger + '20' }]}
            useNativeDriver
          >
            <Text color="danger" style={styles.errorText}>{error}</Text>
          </Animatable.View>
        ) : null}

        <View style={styles.passwordRequirements}>
          <Text variant="body2" color="secondaryText" style={styles.requirementsTitle}>
            Password Requirements:
          </Text>
          <Text variant="caption" color="secondaryText">• At least 8 characters long</Text>
          <Text variant="caption" color="secondaryText">• One uppercase letter</Text>
          <Text variant="caption" color="secondaryText">• One lowercase letter</Text>
          <Text variant="caption" color="secondaryText">• One number</Text>
          <Text variant="caption" color="secondaryText">• One special character (!@#$%^&*)</Text>
        </View>
      </Card>

      <Button
        title={loading ? 'Updating...' : 'Update Password'}
        onPress={handleChangePassword}
        disabled={loading}
        style={styles.updateButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
  },
  backButton: {
    marginRight: spacing.md,
  },
  formCard: {
    margin: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  eyeIcon: {
    padding: spacing.sm,
  },
  errorContainer: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    textAlign: 'center',
  },
  passwordRequirements: {
    marginTop: spacing.md,
  },
  requirementsTitle: {
    marginBottom: spacing.xs,
  },
  updateButton: {
    margin: spacing.md,
    height: 48,
  },
}); 