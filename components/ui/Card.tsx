import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { getTheme, elevation, radius, spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation: elevationLevel = 'sm',
  padding = 'md',
  borderRadius = 'md',
}) => {
  const theme = getTheme(useUIStore((state) => state.theme));

  const getCardStyles = (): StyleProp<ViewStyle> => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
    };

    // Apply padding
    switch (padding) {
      case 'sm':
        baseStyle.padding = spacing.sm;
        break;
      case 'md':
        baseStyle.padding = spacing.md;
        break;
      case 'lg':
        baseStyle.padding = spacing.lg;
        break;
      case 'none':
        break;
    }

    // Apply border radius
    switch (borderRadius) {
      case 'sm':
        baseStyle.borderRadius = radius.sm;
        break;
      case 'md':
        baseStyle.borderRadius = radius.md;
        break;
      case 'lg':
        baseStyle.borderRadius = radius.lg;
        break;
      case 'xl':
        baseStyle.borderRadius = radius.xl;
        break;
      case 'none':
        baseStyle.borderRadius = 0;
        break;
    }

    // Apply elevation
    if (elevationLevel !== 'none') {
      Object.assign(baseStyle, elevation[elevationLevel]);
    }

    return baseStyle;
  };

  return (
    <View style={[styles.container, getCardStyles(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
});

export default Card; 