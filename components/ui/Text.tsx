import React from 'react';
import { Text as RNText, StyleSheet, TextProps as RNTextProps, TextStyle, StyleProp } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { getTheme, typography } from '../../constants/theme';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button';
type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'text' | 'secondaryText';
  weight?: FontWeight;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: StyleProp<TextStyle>;
}

const Text: React.FC<TextProps> = ({
  children,
  variant = 'body1',
  color = 'text',
  weight,
  align,
  style,
  ...props
}) => {
  const theme = getTheme(useUIStore((state) => state.theme));

  const getTextStyles = (): StyleProp<TextStyle> => {
    const baseStyle: TextStyle = {};
    
    // Apply text color
    baseStyle.color = theme[color];
    
    // Apply variant styles
    switch (variant) {
      case 'h1':
        baseStyle.fontSize = typography.fontSizes.xxxl;
        baseStyle.lineHeight = typography.lineHeights.xxxl;
        baseStyle.fontWeight = typography.fontWeights.bold as TextStyle['fontWeight'];
        break;
      case 'h2':
        baseStyle.fontSize = typography.fontSizes.xxl;
        baseStyle.lineHeight = typography.lineHeights.xxl;
        baseStyle.fontWeight = typography.fontWeights.bold as TextStyle['fontWeight'];
        break;
      case 'h3':
        baseStyle.fontSize = typography.fontSizes.xl;
        baseStyle.lineHeight = typography.lineHeights.xl;
        baseStyle.fontWeight = typography.fontWeights.semibold as TextStyle['fontWeight'];
        break;
      case 'h4':
        baseStyle.fontSize = typography.fontSizes.lg;
        baseStyle.lineHeight = typography.lineHeights.lg;
        baseStyle.fontWeight = typography.fontWeights.semibold as TextStyle['fontWeight'];
        break;
      case 'subtitle1':
        baseStyle.fontSize = typography.fontSizes.lg;
        baseStyle.lineHeight = typography.lineHeights.lg;
        baseStyle.fontWeight = typography.fontWeights.medium as TextStyle['fontWeight'];
        break;
      case 'subtitle2':
        baseStyle.fontSize = typography.fontSizes.md;
        baseStyle.lineHeight = typography.lineHeights.md;
        baseStyle.fontWeight = typography.fontWeights.medium as TextStyle['fontWeight'];
        break;
      case 'button':
        baseStyle.fontSize = typography.fontSizes.md;
        baseStyle.lineHeight = typography.lineHeights.md;
        baseStyle.fontWeight = typography.fontWeights.medium as TextStyle['fontWeight'];
        baseStyle.textTransform = 'uppercase';
        break;
      case 'body2':
        baseStyle.fontSize = typography.fontSizes.sm;
        baseStyle.lineHeight = typography.lineHeights.sm;
        break;
      case 'caption':
        baseStyle.fontSize = typography.fontSizes.xs;
        baseStyle.lineHeight = typography.lineHeights.xs;
        break;
      default: // body1
        baseStyle.fontSize = typography.fontSizes.md;
        baseStyle.lineHeight = typography.lineHeights.md;
        break;
    }
    
    // Override font weight if specified
    if (weight) {
      baseStyle.fontWeight = typography.fontWeights[weight] as TextStyle['fontWeight'];
    }
    
    // Apply text alignment if specified
    if (align) {
      baseStyle.textAlign = align;
    }
    
    return baseStyle;
  };

  return (
    <RNText style={[getTextStyles(), style]} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({});

export default Text; 