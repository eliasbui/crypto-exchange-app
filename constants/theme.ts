import { ThemeType } from '../types';

export interface AppTheme {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  border: string;
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  chartGradient: string[];
  positive: string;
  negative: string;
  shadow: string;
}

const lightTheme: AppTheme = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#172B4D',
  secondaryText: '#5E6C84',
  border: '#DFE1E6',
  primary: '#3773F5',
  secondary: '#7A869A',
  success: '#36B37E',
  danger: '#FF5630',
  warning: '#FFAB00',
  info: '#00B8D9',
  chartGradient: ['rgba(55, 115, 245, 0.8)', 'rgba(55, 115, 245, 0.2)'],
  positive: '#36B37E',
  negative: '#FF5630',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const darkTheme: AppTheme = {
  background: '#161B22',
  card: '#21262D',
  text: '#E6EDF3',
  secondaryText: '#8B949E',
  border: '#30363D',
  primary: '#4D8EFF',
  secondary: '#6E7681',
  success: '#3FB950',
  danger: '#F85149',
  warning: '#F0883E',
  info: '#58A6FF',
  chartGradient: ['rgba(77, 142, 255, 0.8)', 'rgba(77, 142, 255, 0.2)'],
  positive: '#3FB950',
  negative: '#F85149',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export const getTheme = (themeType: ThemeType): AppTheme => {
  return themeType === 'light' ? lightTheme : darkTheme;
};

// Typography Styles
export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 56,
};

// Radius
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Elevation
export const elevation = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
}; 