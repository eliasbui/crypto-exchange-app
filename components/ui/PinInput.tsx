import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { getTheme, spacing } from '../../constants/theme';

interface PinInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  secure?: boolean;
}

const PinInput: React.FC<PinInputProps> = ({
  length,
  value,
  onChange,
  onComplete,
  secure = false,
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
      <TextInput
        style={[
          styles.input,
          {
            borderColor: theme.border,
            color: theme.text,
            backgroundColor: theme.card,
          },
        ]}
        value={value}
        onChangeText={handleChange}
        maxLength={length}
        keyboardType="number-pad"
        secureTextEntry={secure}
        autoFocus
        caretHidden
        textContentType="oneTimeCode"
        returnKeyType="done"
      />
      <View style={styles.dots}>
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index < value.length ? theme.primary : theme.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  input: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
});

export default PinInput; 