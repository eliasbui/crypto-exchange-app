import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { useColorScheme, AppState, AppStateStatus } from 'react-native';
import { ThemeProvider } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import Toast from 'react-native-toast-message';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Redirect } from 'expo-router';

import { useAuthStore } from '../store/authStore';
import { useCryptoStore } from '../store/cryptoStore';
import { useWalletStore } from '../store/walletStore';
import { useUIStore } from '../store/uiStore';
import { getTheme } from '../constants/theme';
import { AuthenticationService } from '../services/authenticationService';
import AuthScreen from '../components/AuthScreen';
import NotificationService from '../services/NotificationService';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      '/(tabs)/settings/profile': undefined;
      '/(tabs)/settings/notifications': undefined;
      '/(tabs)/settings/auth-settings': undefined;
      '/(tabs)/settings/setup-pin': undefined;
      '/(tabs)/settings/language': undefined;
      '/(tabs)/settings/help': undefined;
      '/(tabs)/settings/privacy': undefined;
      '/(tabs)/settings/terms': undefined;
      '/(tabs)/settings/about': undefined;
    }
  }
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  // State to track authentication status
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [requireAuth, setRequireAuth] = useState(false);
  
  // App state for detecting background/foreground transitions
  const [appState, setAppState] = useState(AppState.currentState);

  // Various stores
  const colorScheme = useColorScheme();
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initializeData = useCryptoStore((state) => state.initialize);
  const initializeWallet = useWalletStore((state) => state.initialize);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.match(/inactive|background/) && 
      nextAppState === 'active' &&
      isAuthenticated
    ) {
      const isPinSet = await AuthenticationService.isPinCodeSet();
      const isBiometricEnabled = await AuthenticationService.isBiometricEnabled();
      
      if (isPinSet || isBiometricEnabled) {
        setRequireAuth(true);
      }
    }
    
    setAppState(nextAppState);
  };

  const handleAuthSuccess = () => {
    setRequireAuth(false);
  };

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (colorScheme) {
      setTheme(colorScheme);
    }
  }, [colorScheme, setTheme]);

  useEffect(() => {
    async function prepare() {
      try {
        await initializeData();
        await initializeWallet();
        
        const isPinSet = await AuthenticationService.isPinCodeSet();
        const isBiometricEnabled = await AuthenticationService.isBiometricEnabled();
        
        if ((isPinSet || isBiometricEnabled) && isAuthenticated) {
          setRequireAuth(true);
        }
        
        setAuthCheckComplete(true);
      } catch (e) {
        console.warn('Error initializing data:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded && appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appIsReady]);

  useEffect(() => {
    // Initialize notifications when app starts
    NotificationService.initialize();
  }, []);

  useEffect(() => {
    if (isAuthenticated && requireAuth) {
      router.replace('/auth-verify');
    }
  }, [isAuthenticated, requireAuth]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // We could perform additional auth checks here if needed
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };
    
    checkAuth();
  }, []);

  if (!fontsLoaded || !appIsReady || !authCheckComplete) {
    return null;
  }

  const navigationTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: getTheme(theme).background }}>
        <ActivityIndicator color={getTheme(theme).primary} size="large" />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // Redirect to verification if auth is required
  if (requireAuth) {
    return <Redirect href="/auth-verify" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="modal" />
          <Stack.Screen name="auth-verify" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/settings/auth-settings" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/settings/setup-pin" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/settings/notifications" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/settings/profile" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/settings/language" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/settings/help" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/settings/privacy" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/settings/terms" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/settings/about" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        {requireAuth && (
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        )}
        <Toast
          config={{
            success: (props) => (
              <View style={[
                styles.toastContainer,
                { borderLeftColor: getTheme(theme).success }
              ]}>
                <Text style={[styles.toastTitle, { color: getTheme(theme).text }]}>
                  {props.text1}
                </Text>
                {props.text2 && (
                  <Text style={[styles.toastMessage, { color: getTheme(theme).secondaryText }]}>
                    {props.text2}
                  </Text>
                )}
              </View>
            ),
            error: (props) => (
              <View style={[
                styles.toastContainer,
                { borderLeftColor: getTheme(theme).danger }
              ]}>
                <Text style={[styles.toastTitle, { color: getTheme(theme).text }]}>
                  {props.text1}
                </Text>
                {props.text2 && (
                  <Text style={[styles.toastMessage, { color: getTheme(theme).secondaryText }]}>
                    {props.text2}
                  </Text>
                )}
              </View>
            ),
            info: (props) => (
              <View style={[
                styles.toastContainer,
                { borderLeftColor: getTheme(theme).info }
              ]}>
                <Text style={[styles.toastTitle, { color: getTheme(theme).text }]}>
                  {props.text1}
                </Text>
                {props.text2 && (
                  <Text style={[styles.toastMessage, { color: getTheme(theme).secondaryText }]}>
                    {props.text2}
                  </Text>
                )}
              </View>
            ),
          }}
        />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    height: 60,
    width: '90%',
    backgroundColor: getTheme('light').card,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toastMessage: {
    fontSize: 14,
    marginTop: 4,
  },
});
