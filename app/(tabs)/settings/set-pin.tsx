import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { getTheme, spacing, radius } from '../../../constants/theme';
import Text from '../../../components/ui/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';

const PIN_LENGTH = 4;

// Step types for the PIN setup flow
type SetupStep = 'create' | 'confirm' | 'complete';

export default function SetPinScreen() {
  const router = useRouter();
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  
  const { 
    isPinEnabled, 
    setPinCode,
    setPinEnabled 
  } = useAuthStore();
  
  const [pin, setPin] = useState<string>('');
  const [confirmedPin, setConfirmedPin] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<SetupStep>('create');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Handle PIN digit input
  const handlePinDigitPress = (digit: string) => {
    if (error) setError('');
    
    if (currentStep === 'create' && pin.length < PIN_LENGTH) {
      const newPin = pin + digit;
      setPin(newPin);
      
      // Move to confirmation step when PIN is complete
      if (newPin.length === PIN_LENGTH) {
        setTimeout(() => {
          setCurrentStep('confirm');
        }, 300);
      }
    } else if (currentStep === 'confirm' && confirmedPin.length < PIN_LENGTH) {
      const newConfirmedPin = confirmedPin + digit;
      setConfirmedPin(newConfirmedPin);
      
      // Verify PIN match when confirmation is complete
      if (newConfirmedPin.length === PIN_LENGTH) {
        if (newConfirmedPin === pin) {
          handleSavePin(newConfirmedPin);
        } else {
          // PINs don't match
          setError('PINs do not match. Please try again.');
          // Reset confirmation
          setTimeout(() => {
            setConfirmedPin('');
          }, 1000);
        }
      }
    }
  };
  
  // Handle PIN deletion (backspace)
  const handlePinDelete = () => {
    if (error) setError('');
    
    if (currentStep === 'create' && pin.length > 0) {
      setPin(pin.slice(0, -1));
    } else if (currentStep === 'confirm' && confirmedPin.length > 0) {
      setConfirmedPin(confirmedPin.slice(0, -1));
    }
  };
  
  // Save the PIN
  const handleSavePin = async (pinToSave: string) => {
    setLoading(true);
    
    try {
      // Save PIN to secure storage
      const success = await setPinCode(pinToSave);
      
      if (success) {
        // Enable PIN authentication
        await setPinEnabled(true);
        
        // Show success animation
        setCurrentStep('complete');
        
        // Navigate back after a delay
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setError('Failed to save PIN. Please try again.');
        setCurrentStep('create');
        setPin('');
        setConfirmedPin('');
      }
    } catch (err) {
      console.error('Error saving PIN:', err);
      setError('An error occurred. Please try again.');
      setCurrentStep('create');
      setPin('');
      setConfirmedPin('');
    } finally {
      setLoading(false);
    }
  };
  
  // Get title and subtitle based on current step
  const getTitle = () => {
    switch (currentStep) {
      case 'create':
        return isPinEnabled ? 'Change PIN' : 'Create PIN';
      case 'confirm':
        return 'Confirm PIN';
      case 'complete':
        return 'PIN Set Successfully';
      default:
        return 'Set PIN';
    }
  };
  
  const getSubtitle = () => {
    switch (currentStep) {
      case 'create':
        return 'Enter a 4-digit PIN code';
      case 'confirm':
        return 'Enter the same PIN again to confirm';
      case 'complete':
        return 'Your PIN has been saved successfully';
      default:
        return '';
    }
  };
  
  // Get the current PIN to display based on step
  const getCurrentPin = () => {
    if (currentStep === 'create') return pin;
    if (currentStep === 'confirm') return confirmedPin;
    return '';
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        {currentStep !== 'complete' && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            disabled={loading}
          >
            <MaterialCommunityIcons 
              name="arrow-left" 
              size={24} 
              color={theme.text} 
            />
          </TouchableOpacity>
        )}
        
        <Text variant="h4" weight="bold" style={styles.title}>
          {getTitle()}
        </Text>
        <Text variant="body1" color="secondaryText" style={styles.subtitle}>
          {getSubtitle()}
        </Text>
      </View>
      
      <View style={styles.content}>
        {error ? (
          <Animatable.View 
            animation="shake" 
            style={[styles.errorContainer, { backgroundColor: theme.danger + '20' }]}
            useNativeDriver
          >
            <Text color="danger" style={styles.errorText}>{error}</Text>
          </Animatable.View>
        ) : null}
        
        {currentStep === 'complete' ? (
          <Animatable.View 
            animation="bounceIn" 
            style={styles.successContainer}
            useNativeDriver
          >
            <View style={[styles.successIcon, { backgroundColor: theme.success + '20' }]}>
              <MaterialCommunityIcons 
                name="check" 
                size={60} 
                color={theme.success} 
              />
            </View>
            <Text variant="h5" weight="bold" style={styles.successText}>
              PIN Set Successfully
            </Text>
          </Animatable.View>
        ) : (
          <>
            <View style={styles.pinDisplay}>
              {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.pinDot, 
                    { 
                      backgroundColor: index < getCurrentPin().length ? theme.primary : 'transparent',
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
                    disabled={loading}
                  >
                    <Text variant="h4">
                      {digit}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
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
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  errorContainer: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    width: '80%',
  },
  errorText: {
    textAlign: 'center',
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
    marginTop: spacing.lg,
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
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successText: {
    marginTop: spacing.md,
  },
}); 