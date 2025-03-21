import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { getTheme, spacing, radius } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as LocalAuthentication from 'expo-local-authentication';

const PIN_LENGTH = 4;

export default function AuthScreen() {
  const router = useRouter();
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  
  const { 
    isAuthenticated,
    isBiometricEnabled, 
    isPinEnabled,
    pinCode,
    verifyPinCode,
  } = useAuthStore();
  
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricError, setBiometricError] = useState('');
  const [supportedBiometrics, setSupportedBiometrics] = useState<string[]>([]);
  
  // If already authenticated, navigate to home
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);
  
  // Check biometric capabilities on mount
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const supported = await LocalAuthentication.hasHardwareAsync();
        if (supported) {
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          const biometricTypes = [];
          
          if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            biometricTypes.push('fingerprint');
          }
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            biometricTypes.push('facial');
          }
          if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            biometricTypes.push('iris');
          }
          
          setSupportedBiometrics(biometricTypes);
          
          // If biometric is enabled and supported, try to authenticate immediately
          if (isBiometricEnabled && biometricTypes.length > 0) {
            handleBiometricAuthentication();
          }
        }
      } catch (err) {
        console.error('Error checking biometrics:', err);
      }
    };
    
    checkBiometrics();
  }, []);
  
  // Handle PIN digit input
  const handlePinDigitPress = (digit: string) => {
    if (error) setError('');
    
    if (pin.length < PIN_LENGTH) {
      const newPin = pin + digit;
      setPin(newPin);
      
      // Check PIN when all digits are entered
      if (newPin.length === PIN_LENGTH) {
        handlePinAuthentication(newPin);
      }
    }
  };
  
  // Handle PIN deletion (backspace)
  const handlePinDelete = () => {
    if (error) setError('');
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };
  
  // Authenticate with PIN
  const handlePinAuthentication = async (pinToCheck: string = pin) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify PIN
    if (await verifyPinCode(pinToCheck)) {
      // Authenticate the user
      router.replace('/');
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
    
    setLoading(false);
  };
  
  // Handle biometric authentication
  const handleBiometricAuthentication = async () => {
    try {
      setBiometricError('');
      const results = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });
      
      if (results.success) {
        // Biometric authentication successful
        router.replace('/');
      } else if (results.error === 'lockout') {
        setBiometricError('Too many attempts. Please use your PIN.');
      } else if (results.error === 'user_cancel') {
        // User canceled, do nothing
      } else {
        setBiometricError('Authentication failed. Please try again or use PIN.');
      }
    } catch (err) {
      console.error('Biometric authentication error:', err);
      setBiometricError('An error occurred. Please use your PIN.');
    }
  };
  
  // Get biometric icon based on available types
  const getBiometricIcon = () => {
    if (supportedBiometrics.includes('facial')) {
      return 'face-recognition';
    } else if (supportedBiometrics.includes('fingerprint')) {
      return 'fingerprint';
    } else if (supportedBiometrics.includes('iris')) {
      return 'eye-outline';
    }
    return 'shield-check-outline';
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
          Authentication Required
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          {isPinEnabled 
            ? 'Enter your PIN to continue' 
            : 'Use biometric authentication to continue'}
        </Text>
      </Animatable.View>
      
      <Animatable.View 
        animation="fadeIn" 
        delay={300} 
        duration={600}
        style={styles.content}
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
        ) : biometricError ? (
          <Animatable.View 
            style={[styles.errorContainer, { backgroundColor: theme.warning + '20' }]}
            useNativeDriver
          >
            <Text color="warning" style={styles.errorText}>{biometricError}</Text>
          </Animatable.View>
        ) : null}
        
        {isPinEnabled && (
          <View style={styles.pinSection}>
            <View style={styles.pinDisplay}>
              {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.pinDot, 
                    { 
                      backgroundColor: index < pin.length ? theme.primary : 'transparent',
                      borderColor: theme.border 
                    }
                  ]}
                />
              ))}
            </View>
            
            <View style={styles.pinPad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((digit, index) => {
                if (digit === '') {
                  return <View key={index} style={styles.pinKey} />;
                }
                
                if (digit === 'del') {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.pinKey, { backgroundColor: 'transparent' }]}
                      onPress={handlePinDelete}
                      disabled={loading}
                    >
                      <MaterialCommunityIcons 
                        name="backspace-outline" 
                        size={28} 
                        color={theme.text} 
                      />
                    </TouchableOpacity>
                  );
                }
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.pinKey, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => handlePinDigitPress(digit)}
                    disabled={loading || pin.length >= PIN_LENGTH}
                  >
                    <Text variant="body1" weight="bold">
                      {digit}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}
        
        {isBiometricEnabled && supportedBiometrics.length > 0 && (
          <Animatable.View 
            animation="bounceIn" 
            delay={600} 
            style={styles.biometricContainer}
            useNativeDriver
          >
            {!isPinEnabled ? (
              <Text variant="body1" style={styles.biometricText}>
                Use biometric authentication to unlock
              </Text>
            ) : (
              <Text variant="body2" color="secondaryText" style={styles.biometricText}>
                Or use biometric authentication
              </Text>
            )}
            
            <TouchableOpacity
              style={[styles.biometricButton, { backgroundColor: theme.card }]}
              onPress={handleBiometricAuthentication}
              disabled={loading}
            >
              <MaterialCommunityIcons 
                name={getBiometricIcon()}
                size={32} 
                color={theme.primary} 
              />
            </TouchableOpacity>
          </Animatable.View>
        )}
      </Animatable.View>
      
      <View style={styles.emergencyContainer}>
        <TouchableOpacity onPress={() => router.replace('/auth/login')}>
          <Text color="primary" variant="body2">
            Sign out and switch accounts
          </Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    textAlign: 'center',
  },
  pinSection: {
    alignItems: 'center',
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 10,
  },
  pinPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
  },
  pinKey: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  biometricContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  biometricText: {
    marginBottom: spacing.md,
  },
  biometricButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
}); 