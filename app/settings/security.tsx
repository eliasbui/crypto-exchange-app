import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { StatusBar } from 'expo-status-bar';
import { useUIStore } from '../../store/uiStore';
import { getTheme, spacing, radius } from '../../constants/theme';
import { AuthenticationService } from '../../services/authenticationService';
import Text from '../../components/ui/Text';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function SecurityScreen() {
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  
  const [loading, setLoading] = useState(true);
  const [biometricsSupported, setBiometricsSupported] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [pinCodeSet, setPinCodeSet] = useState(false);
  
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Check if device supports biometrics
        const isBiometricAvailable = await AuthenticationService.isBiometricAvailable();
        setBiometricsSupported(isBiometricAvailable);
        
        // Get biometric type name
        if (isBiometricAvailable) {
          const typeName = await AuthenticationService.getBiometricTypeName();
          setBiometricType(typeName);
        }
        
        // Check if biometrics is enabled
        const isBiometricEnabled = await AuthenticationService.isBiometricEnabled();
        setBiometricsEnabled(isBiometricEnabled);
        
        // Check if PIN is set
        const isPinSet = await AuthenticationService.isPinCodeSet();
        setPinCodeSet(isPinSet);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthentication();
  }, []);
  
  const handleToggleBiometrics = async (value: boolean) => {
    if (value && !pinCodeSet) {
      // PIN must be set before enabling biometrics
      Alert.alert(
        'PIN Required',
        'You need to set up a PIN code before enabling biometric authentication.',
        [{ text: 'OK', onPress: () => setShowPinSetup(true) }]
      );
      return;
    }
    
    if (value) {
      // Test biometric authentication before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });
      
      if (result.success) {
        await AuthenticationService.setBiometricEnabled(true);
        setBiometricsEnabled(true);
        Alert.alert('Success', `${biometricType} authentication enabled successfully.`);
      }
    } else {
      await AuthenticationService.setBiometricEnabled(false);
      setBiometricsEnabled(false);
      Alert.alert('Disabled', `${biometricType} authentication has been disabled.`);
    }
  };
  
  const handleSetPin = async () => {
    if (pin.length < 4) {
      Alert.alert('Invalid PIN', 'PIN must be at least 4 digits long.');
      return;
    }
    
    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
      setConfirmPin('');
      return;
    }
    
    const success = await AuthenticationService.setPinCode(pin);
    if (success) {
      setPinCodeSet(true);
      setShowPinSetup(false);
      setPin('');
      setConfirmPin('');
      Alert.alert('Success', 'PIN code has been set successfully.');
    } else {
      Alert.alert('Error', 'Failed to set PIN code. Please try again.');
    }
  };
  
  const handleChangePin = () => {
    setShowPinSetup(true);
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  
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
        <Text variant="h4" weight="semibold">Security Settings</Text>
      </View>
      
      {showPinSetup ? (
        <Card style={styles.pinSetupCard}>
          <Text variant="h4" weight="semibold" style={styles.cardTitle}>
            {pinCodeSet ? 'Change PIN Code' : 'Set PIN Code'}
          </Text>
          
          <Text variant="body2" color="secondaryText" style={styles.pinDescription}>
            Your PIN code will be used as a backup when biometric authentication fails or is unavailable.
          </Text>
          
          <View style={styles.pinInputContainer}>
            <Text variant="body2" weight="semibold">Enter PIN</Text>
            <TextInput 
              style={[styles.pinInput, { borderColor: theme.danger, color: theme.text }]}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={pin}
              onChangeText={setPin}
              placeholder="Enter 4-6 digit PIN"
              placeholderTextColor={theme.secondaryText}
            />
          </View>
          
          <View style={styles.pinInputContainer}>
            <Text variant="body2" weight="semibold">Confirm PIN</Text>
            <TextInput 
              style={[styles.pinInput, { borderColor: theme.border, color: theme.text }]}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={confirmPin}
              onChangeText={setConfirmPin}
              placeholder="Confirm PIN"
              placeholderTextColor={theme.secondaryText}
            />
          </View>
          
          <View style={styles.pinButtons}>
            <Button 
              title="Cancel" 
              variant="secondary" 
              onPress={() => {
                setShowPinSetup(false);
                setPin('');
                setConfirmPin('');
              }}
              style={styles.pinButton}
            />
            <Button 
              title="Save PIN" 
              variant="primary" 
              onPress={handleSetPin}
              style={styles.pinButton}
            />
          </View>
        </Card>
      ) : (
        <>
          <Card style={styles.securityCard}>
            <View style={styles.securitySetting}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: theme.primary + '20' }]}>
                  <MaterialCommunityIcons name="lock" size={24} color={theme.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text variant="subtitle1" weight="semibold">PIN Code</Text>
                  <Text variant="body2" color="secondaryText">
                    {pinCodeSet 
                      ? 'Your PIN code is set. You can change it anytime.'
                      : 'Set a PIN code for additional security'
                    }
                  </Text>
                </View>
              </View>
              <Button
                title={pinCodeSet ? "Change PIN" : "Set PIN"}
                variant="secondary" 
                onPress={handleChangePin}
                size="sm"
              />
            </View>
            
            {biometricsSupported && (
              <View style={[styles.securitySetting, { borderTopWidth: 1, borderTopColor: theme.border }]}>
                <View style={styles.settingInfo}>
                  <View style={[styles.settingIcon, { backgroundColor: theme.primary + '20' }]}>
                    <MaterialCommunityIcons name="fingerprint" size={24} color={theme.primary} />
                  </View>
                  <View style={styles.settingText}>
                    <Text variant="subtitle1" weight="semibold">{biometricType} Authentication</Text>
                    <Text variant="body2" color="secondaryText">
                      {biometricsEnabled 
                        ? `${biometricType} authentication is enabled`
                        : `Use ${biometricType.toLowerCase()} to sign in quickly`
                      }
                    </Text>
                  </View>
                </View>
                <Switch
                  value={biometricsEnabled}
                  onValueChange={handleToggleBiometrics}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={biometricsEnabled ? theme.primary : theme.card}
                  disabled={!pinCodeSet}
                />
              </View>
            )}
          </Card>
          
          <Card style={[styles.securityCard, styles.securityTipsCard]}>
            <Text variant="subtitle1" weight="semibold" style={styles.tipsTitle}>Security Tips</Text>
            
            <View style={styles.securityTip}>
              <MaterialCommunityIcons name="check-circle" size={20} color={theme.success} style={styles.tipIcon} />
              <Text variant="body2">Never share your PIN code with anyone</Text>
            </View>
            
            <View style={styles.securityTip}>
              <MaterialCommunityIcons name="check-circle" size={20} color={theme.success} style={styles.tipIcon} />
              <Text variant="body2">Use a PIN that is not easy to guess</Text>
            </View>
            
            <View style={styles.securityTip}>
              <MaterialCommunityIcons name="check-circle" size={20} color={theme.success} style={styles.tipIcon} />
              <Text variant="body2">Enable biometric authentication for better security</Text>
            </View>
          </Card>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    paddingTop: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    marginRight: spacing.md,
  },
  securityCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  securitySetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingText: {
    flex: 1,
  },
  pinSetupCard: {
    padding: spacing.md,
  },
  cardTitle: {
    marginBottom: spacing.md,
  },
  pinDescription: {
    marginBottom: spacing.lg,
  },
  pinInputContainer: {
    marginBottom: spacing.md,
  },
  pinInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  pinButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  pinButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  securityTipsCard: {
    marginTop: spacing.lg,
  },
  tipsTitle: {
    marginBottom: spacing.md,
  },
  securityTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipIcon: {
    marginRight: spacing.sm,
  },
}); 