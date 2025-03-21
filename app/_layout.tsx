import React, { useEffect, useState } from 'react';
import { useColorScheme, AppState, AppStateStatus } from 'react-native';
import { ThemeProvider } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import Toast from 'react-native-toast-message';
import { View, Text, StyleSheet } from 'react-native';

import { useAuthStore } from '../store/authStore';
import { useCryptoStore } from '../store/cryptoStore';
import { useWalletStore } from '../store/walletStore';
import { useUIStore } from '../store/uiStore';
import { getTheme } from '../constants/theme';
import { AuthenticationService } from '../services/authenticationService';
import AuthScreen from '../components/AuthScreen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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
    // Check if app is coming back to foreground
    if (
      appState.match(/inactive|background/) && 
      nextAppState === 'active' &&
      isAuthenticated
    ) {
      // Check if biometric or PIN authentication is required
      const isPinSet = await AuthenticationService.isPinCodeSet();
      const isBiometricEnabled = await AuthenticationService.isBiometricEnabled();
      
      if (isPinSet || isBiometricEnabled) {
        setRequireAuth(true);
      }
    }
    
    setAppState(nextAppState);
  };

  // Handle successful authentication
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
        // Initialize data
        await initializeData();
        await initializeWallet();
        
        // Check if authentication is needed at app startup
        const isPinSet = await AuthenticationService.isPinCodeSet();
        const isBiometricEnabled = await AuthenticationService.isBiometricEnabled();
        
        if ((isPinSet || isBiometricEnabled) && isAuthenticated) {
          setRequireAuth(true);
        }
        
        // Mark authentication check as complete
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

  if (!fontsLoaded || !appIsReady || !authCheckComplete) {
    return null;
  }

  const navigationTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {requireAuth ? (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      ) : (
        <Slot />
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
