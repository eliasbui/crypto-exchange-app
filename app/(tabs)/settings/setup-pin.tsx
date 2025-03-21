import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { getTheme, spacing } from '../../../constants/theme';
import Text from '../../../components/ui/Text';
import Card from '../../../components/ui/Card';
import { router } from 'expo-router';

const PIN_LENGTH = 6;

export default function SetupPINScreen() {
  const theme = getTheme(useUIStore((state) => state.theme));
  const { setPinCode } = useAuthStore();
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState('');

  const handleNumberPress = (number: string) => {
    setError('');
    if (step === 'create' && pin.length < PIN_LENGTH) {
      const newPin = pin + number;
      setPin(newPin);
      if (newPin.length === PIN_LENGTH) {
        setStep('confirm');
      }
    } else if (step === 'confirm' && confirmPin.length < PIN_LENGTH) {
      const newConfirmPin = confirmPin + number;
      setConfirmPin(newConfirmPin);
      if (newConfirmPin.length === PIN_LENGTH) {
        handlePinConfirmation(newConfirmPin);
      }
    }
  };

  const handleDelete = () => {
    if (step === 'create' && pin.length > 0) {
      setPin(pin.slice(0, -1));
    } else if (step === 'confirm' && confirmPin.length > 0) {
      setConfirmPin(confirmPin.slice(0, -1));
    }
    setError('');
  };

  const handlePinConfirmation = async (confirmedPin: string) => {
    if (confirmedPin === pin) {
      try {
        await setPinCode(pin);
        Alert.alert(
          'Success',
          'PIN code has been set successfully',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } catch (error) {
        console.error('Error setting PIN:', error);
        Alert.alert('Error', 'Failed to set PIN. Please try again.');
        resetPinSetup();
      }
    } else {
      setError('PINs do not match. Please try again.');
      resetPinConfirmation();
    }
  };

  const resetPinSetup = () => {
    setPin('');
    setConfirmPin('');
    setStep('create');
    setError('');
  };

  const resetPinConfirmation = () => {
    setConfirmPin('');
  };

  const renderPinDots = () => {
    const currentPin = step === 'create' ? pin : confirmPin;
    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index < currentPin.length ? theme.primary : theme.border,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'delete'],
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((num, colIndex) => {
              if (num === '') {
                return <View key={colIndex} style={styles.numberButton} />;
              }
              if (num === 'delete') {
                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={styles.numberButton}
                    onPress={handleDelete}
                  >
                    <MaterialCommunityIcons
                      name="backspace-outline"
                      size={24}
                      color={theme.text}
                    />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={colIndex}
                  style={styles.numberButton}
                  onPress={() => handleNumberPress(num)}
                >
                  <Text variant="h4">{num}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
          Set Up PIN
        </Text>
      </View>

      <Card style={styles.pinCard}>
        <Text variant="h3" weight="semibold" style={styles.instruction}>
          {step === 'create' 
            ? 'Create your PIN code'
            : 'Confirm your PIN code'
          }
        </Text>
        <Text variant="body2" color="secondaryText" style={styles.subtitle}>
          {step === 'create'
            ? 'Choose a 6-digit PIN for secure access'
            : 'Enter the same PIN again to confirm'
          }
        </Text>

        {renderPinDots()}

        {error ? (
          <Text variant="body2" style={[styles.error, { color: theme.warning
           }]}>
            {error}
          </Text>
        ) : (
          <View style={styles.errorPlaceholder} />
        )}
      </Card>

      {renderNumberPad()}

      <Text variant="caption" color="secondaryText" style={styles.disclaimer}>
        Your PIN will be required when accessing the app and making transactions.
      </Text>
    </View>
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
  pinCard: {
    margin: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  instruction: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  error: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  errorPlaceholder: {
    height: 20,
    marginTop: spacing.sm,
  },
  numberPad: {
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  numberButton: {
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimer: {
    margin: spacing.lg,
    textAlign: 'center',
  },
}); 