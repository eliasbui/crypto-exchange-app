import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUIStore } from '../store/uiStore';
import { getTheme, spacing, radius } from '../constants/theme';
import { AuthenticationService } from '../services/authenticationService';
import Text from './ui/Text';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  
  const [loading, setLoading] = useState(true);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [pinEnabled, setPinEnabled] = useState(false);
  
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  
  useEffect(() => {
    const checkAuthenticationOptions = async () => {
      try {
        // Check if biometrics is available on this device
        const isAvailable = await AuthenticationService.isBiometricAvailable();
        setBiometricsAvailable(isAvailable);
        
        // Get the name of the biometric type
        if (isAvailable) {
          const type = await AuthenticationService.getBiometricTypeName();
          setBiometricType(type);
        }
        
        // Check if biometrics is enabled for authentication
        const isEnabled = await AuthenticationService.isBiometricEnabled();
        setBiometricsEnabled(isEnabled);
        
        // Check if PIN code is set
        const isPinSet = await AuthenticationService.isPinCodeSet();
        setPinEnabled(isPinSet);
        
        // If biometrics is enabled, attempt biometric authentication immediately
        if (isEnabled) {
          authenticateWithBiometrics();
        }
      } catch (error) {
        console.error('Error checking authentication options:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthenticationOptions();
  }, []);
  
  const authenticateWithBiometrics = async () => {
    try {
      setLoading(true);
      const success = await AuthenticationService.authenticateWithBiometrics();
      
      if (success) {
        onAuthSuccess();
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePinSubmit = async () => {
    if (pinInput.length < 4) {
      setPinError('Please enter your PIN code');
      return;
    }
    
    try {
      setLoading(true);
      const isValid = await AuthenticationService.verifyPinCode(pinInput);
      
      if (isValid) {
        setPinError('');
        onAuthSuccess();
      } else {
        const newAttemptsRemaining = attemptsRemaining - 1;
        setAttemptsRemaining(newAttemptsRemaining);
        
        if (newAttemptsRemaining > 0) {
          setPinError(`Incorrect PIN. ${newAttemptsRemaining} attempts remaining.`);
        } else {
          Alert.alert(
            'Too Many Failed Attempts',
            'Please try again later.',
            [{ text: 'OK' }]
          );
        }
        
        setPinInput('');
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setPinError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="shield-lock" 
          size={56} 
          color={theme.primary} 
          style={styles.icon}
        />
        
        <Text variant="h4" weight="semibold" style={styles.title}>
          Authentication Required
        </Text>
        
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          Please verify your identity to continue
        </Text>
        
        {pinEnabled && (
          <View style={styles.pinContainer}>
            <Text variant="body2" weight="semibold" style={styles.pinLabel}>
              Enter your PIN code
            </Text>
            
            <TextInput
              style={[
                styles.pinInput,
                { borderColor: pinError ? theme.danger : theme.border, color: theme.text }
              ]}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              value={pinInput}
              onChangeText={(text) => {
                setPinInput(text);
                setPinError('');
              }}
              onSubmitEditing={handlePinSubmit}
              placeholder="Enter PIN"
              placeholderTextColor={theme.secondaryText}
            />
            
            {pinError ? (
              <Text variant="body2" color="danger" style={styles.pinError}>
                {pinError}
              </Text>
            ) : null}
            
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.primary }]}
              onPress={handlePinSubmit}
            >
              <Text variant="button" style={styles.submitButtonText}>
                Verify PIN
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {biometricsAvailable && biometricsEnabled && (
          <TouchableOpacity
            style={[styles.biometricButton, { borderColor: theme.border }]}
            onPress={authenticateWithBiometrics}
          >
            <MaterialCommunityIcons 
              name="fingerprint" 
              size={28} 
              color={theme.primary} 
            />
            <Text variant="body1" color="primary" style={styles.biometricText}>
              Use {biometricType}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  pinContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  pinLabel: {
    marginBottom: spacing.xs,
  },
  pinInput: {
    height: 56,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  pinError: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  submitButton: {
    height: 50,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonText: {
    color: 'white',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  biometricText: {
    marginLeft: spacing.sm,
  },
});

export default AuthScreen; 