import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { getTheme, spacing } from '../../constants/theme';

interface OtpInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length,
  value,
  onChange,
  onComplete,
}) => {
  const theme = getTheme(useUIStore((state) => state.theme));

  const handleChange = (text: string) => {
    // Only allow numbers
    const newValue = text.replace(/[^0-9]/g, '');
    
    if (newValue.length <= length) {
      onChange(newValue);
      
      if (newValue.length === length && onComplete) {
        onComplete(newValue);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.digit,
              {
                borderColor: index < value.length ? theme.primary : theme.border,
                backgroundColor: theme.card,
              },
            ]}
          >
            <TextInput
              style={[styles.digitInput, { color: theme.text }]}
              value={value[index] || ''}
              editable={false}
            />
          </View>
        ))}
      </View>
      <TextInput
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        maxLength={length}
        keyboardType="number-pad"
        autoFocus
        caretHidden
        textContentType="oneTimeCode"
        returnKeyType="done"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  digit: {
    width: 40,
    height: 48,
    borderWidth: 2,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitInput: {
    fontSize: 20,
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default OtpInput; 