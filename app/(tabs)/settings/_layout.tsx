import { Stack } from 'expo-router';
import { useUIStore } from '../../../store/uiStore';
import { getTheme } from '../../../constants/theme';

export default function SettingsLayout() {
  const theme = getTheme(useUIStore((state) => state.theme));

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="setup-pin" options={{ presentation: 'modal' }} />
      <Stack.Screen name="auth-settings" options={{ presentation: 'modal' }} />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="language" />
      <Stack.Screen name="help" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="about" />
    </Stack>
  );
} 