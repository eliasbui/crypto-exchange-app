import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useUIStore } from '../../store/uiStore';
import { getTheme, radius, spacing, typography } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const theme = getTheme(useUIStore((state) => state.theme));

  const getButtonStyles = (): StyleProp<ViewStyle> => {
    const baseStyle: ViewStyle = {
      borderRadius: radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };

    // Size styles
    switch (size) {
      case 'sm':
        baseStyle.paddingVertical = spacing.xs;
        baseStyle.paddingHorizontal = spacing.md;
        break;
      case 'lg':
        baseStyle.paddingVertical = spacing.md;
        baseStyle.paddingHorizontal = spacing.xl;
        break;
      default: // 'md'
        baseStyle.paddingVertical = spacing.sm;
        baseStyle.paddingHorizontal = spacing.lg;
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = theme.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.primary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
      default: // 'primary'
        baseStyle.backgroundColor = theme.primary;
    }

    // Disabled state
    if (disabled) {
      baseStyle.opacity = 0.6;
    }

    // Full width
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyles = (): StyleProp<TextStyle> => {
    const baseStyle: TextStyle = {
      fontSize: typography.fontSizes.md,
      fontWeight: typography.fontWeights.medium as TextStyle['fontWeight'],
    };

    // Size styles
    switch (size) {
      case 'sm':
        baseStyle.fontSize = typography.fontSizes.sm;
        break;
      case 'lg':
        baseStyle.fontSize = typography.fontSizes.lg;
        break;
      default: // 'md'
        baseStyle.fontSize = typography.fontSizes.md;
    }

    // Variant styles
    switch (variant) {
      case 'outline':
      case 'ghost':
        baseStyle.color = theme.primary;
        break;
      default: // 'primary', 'secondary'
        baseStyle.color = '#FFFFFF';
    }

    return baseStyle;
  };

  // Handle button press with animation
  const handlePress = () => {
    if (disabled || loading) return;
    onPress();
  };

  // Animation for button press
  const AnimatedTouchable = Animatable.createAnimatableComponent(TouchableOpacity);

  // Calculate margin style for text when icon is present
  const getIconMarginStyle = (): StyleProp<TextStyle> => {
    if (!icon) return {};
    
    return iconPosition === 'left' 
      ? { marginLeft: spacing.sm } 
      : { marginRight: spacing.sm };
  };

  return (
    <AnimatedTouchable
      style={[styles.container, getButtonStyles(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      animation={disabled || loading ? undefined : 'pulse'}
      duration={300}
      useNativeDriver
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? theme.primary : '#FFFFFF'} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={[styles.text, getTextStyles(), getIconMarginStyle(), textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 80,
  },
  text: {
    textAlign: 'center',
  },
});

export default Button; 