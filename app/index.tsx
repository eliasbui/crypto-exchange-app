import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { getTheme } from '../constants/theme';

export default function Root() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const theme = getTheme(useUIStore((state) => state.theme));
  
  // While loading authentication state, show a loading indicator
  if (isAuthenticated === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }
  
  // Redirect based on authentication status
  return isAuthenticated ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/auth/login" />
  );
} 