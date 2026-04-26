import { IntegrityBanner } from '@/components/IntegrityBanner';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function AppLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingIndicator fullscreen />;
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={styles.root}>
      <IntegrityBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="biometric-setup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="property/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="property/[id]/index" />
        <Stack.Screen name="property/[id]/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="tenant/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="tenant/[id]/index" />
        <Stack.Screen name="tenant/[id]/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="contract/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="contract/[id]/index" />
        <Stack.Screen name="contract/[id]/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="contract/[id]/view-file" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
