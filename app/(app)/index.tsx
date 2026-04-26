import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function AppIndex() {
  const { biometricChoiceMade } = useAuth();
  if (!biometricChoiceMade) {
    return <Redirect href="/(app)/biometric-setup" />;
  }
  return <Redirect href="/(app)/(tabs)/properties" />;
}
