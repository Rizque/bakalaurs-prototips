import { AuthProvider } from '@/contexts/AuthContext';
import { DeviceIntegrityProvider } from '@/contexts/DeviceIntegrityContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DeviceIntegrityProvider>
        <AuthProvider>
          <StatusBar hidden />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </AuthProvider>
      </DeviceIntegrityProvider>
    </SafeAreaProvider>
  );
}
