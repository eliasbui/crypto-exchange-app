import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUIStore } from '../../store/uiStore';
import { getTheme } from '../../constants/theme';

export default function AuthLayout() {
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);
  
  return (
    <>
      <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'fade',
        }}
      />
    </>
  );
} 