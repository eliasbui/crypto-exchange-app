import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { getTheme, spacing } from '../../../constants/theme';
import Text from '../../../components/ui/Text';
import Card from '../../../components/ui/Card';
import { router } from 'expo-router';

export default function AuthSettingsScreen() {
  const theme = getTheme(useUIStore((state) => state.theme));
  const { user } = useAuthStore();
  
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [emailVerificationEnabled, setEmailVerificationEnabled] = useState(true);
  const [pinEnabled, setPinEnabled] = useState(false);

  useEffect(() => {
    checkBiometrics();
    loadSecuritySettings();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setHasBiometrics(compatible && enrolled);
  };

  const loadSecuritySettings = async () => {
    // In a real app, these would be loaded from secure storage or backend
    setBiometricsEnabled(false);
    setEmailVerificationEnabled(true);
    setPinEnabled(false);
  };

  const handleToggleBiometrics = async (value: boolean) => {
    if (value && hasBiometrics) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable biometric login',
        });
        
        if (result.success) {
          setBiometricsEnabled(true);
          // Save setting to secure storage/backend
          Alert.alert('Success', 'Biometric login enabled');
        }
      } catch (error) {
        console.error('Biometric authentication error:', error);
        Alert.alert('Error', 'Failed to enable biometric login');
      }
    } else {
      setBiometricsEnabled(false);
      // Save setting to secure storage/backend
      Alert.alert('Success', 'Biometric login disabled');
    }
  };

  const handleSetupPIN = () => {
    router.push('/(tabs)/settings/setup-pin');
  };

  const handleChangePIN = () => {
    router.push('/(tabs)/settings/setup-pin');
  };

  const handleToggleEmailVerification = (value: boolean) => {
    if (!value && !pinEnabled && !biometricsEnabled) {
      Alert.alert(
        'Security Warning',
        'You must have at least one security method enabled. Enable PIN or biometric login first.'
      );
      return;
    }
    setEmailVerificationEnabled(value);
    // Save setting to secure storage/backend
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
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
          Security Settings
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          Manage your account security
        </Text>
      </View>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons 
            name="fingerprint" 
            size={24} 
            color={theme.primary} 
          />
          <Text variant="subtitle1" weight="semibold" style={styles.sectionTitle}>
            Biometric Login
          </Text>
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text variant="body1">Use Face ID / Touch ID</Text>
            <Text variant="body2" color="secondaryText">
              {hasBiometrics 
                ? 'Quickly login using your biometric data' 
                : 'Biometric authentication not available on this device'}
            </Text>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={handleToggleBiometrics}
            trackColor={{ false: theme.border, true: theme.primary + '80' }}
            thumbColor={biometricsEnabled ? theme.primary : theme.card}
            disabled={!hasBiometrics}
          />
        </View>
      </Card>

      <Card style={[styles.section, { marginTop: spacing.md }]}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons 
            name="email-check" 
            size={24} 
            color={theme.primary} 
          />
          <Text variant="subtitle1" weight="semibold" style={styles.sectionTitle}>
            Email Verification
          </Text>
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text variant="body1">Require Email OTP</Text>
            <Text variant="body2" color="secondaryText">
              Send a verification code to {user?.email}
            </Text>
          </View>
          <Switch
            value={emailVerificationEnabled}
            onValueChange={handleToggleEmailVerification}
            trackColor={{ false: theme.border, true: theme.primary + '80' }}
            thumbColor={emailVerificationEnabled ? theme.primary : theme.card}
          />
        </View>
      </Card>

      <Card style={[styles.section, { marginTop: spacing.md }]}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons 
            name="pin" 
            size={24} 
            color={theme.primary} 
          />
          <Text variant="subtitle1" weight="semibold" style={styles.sectionTitle}>
            PIN Code
          </Text>
        </View>
        {!pinEnabled ? (
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={handleSetupPIN}
          >
            <View style={styles.settingInfo}>
              <Text variant="body1">Set up PIN Code</Text>
              <Text variant="body2" color="secondaryText">
                Add an extra layer of security
              </Text>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.secondaryText} 
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={handleChangePIN}
          >
            <View style={styles.settingInfo}>
              <Text variant="body1">Change PIN Code</Text>
              <Text variant="body2" color="secondaryText">
                Update your security PIN
              </Text>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.secondaryText} 
            />
          </TouchableOpacity>
        )}
      </Card>

      <Card style={[styles.warningCard, { borderColor: theme.primary }]}>
        <MaterialCommunityIcons
          name="shield-alert"
          size={24}
          color={theme.primary}
          style={styles.warningIcon}
        />
        <Text variant="body1" weight="semibold" style={styles.warningTitle}>
          Account Security
        </Text>
        <Text variant="body2" color="secondaryText" style={styles.warningText}>
          We recommend enabling at least two security methods to protect your account. This helps prevent unauthorized access even if one method is compromised.
        </Text>
      </Card>

      <Text variant="caption" color="secondaryText" style={styles.disclaimer}>
        Your security is our top priority. All biometric data is stored securely on your device and is never transmitted to our servers.
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
    paddingTop: spacing.xxxl,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  section: {
    marginHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    marginLeft: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  warningCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  warningIcon: {
    marginBottom: spacing.sm,
  },
  warningTitle: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  warningText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  disclaimer: {
    margin: spacing.lg,
    textAlign: 'center',
  },
}); 