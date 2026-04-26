import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function BiometricSetupScreen() {
  const { setBiometricEnabled } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const enable = async () => {
    setError(null);
    setLoading(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) {
        setError(
          'Šajā ierīcē nav pieejama biometriskā autentifikācija. Iespējojiet to ierīces iestatījumos.'
        );
        setLoading(false);
        return;
      }
      await setBiometricEnabled(true);
      router.replace('/(app)/(tabs)/properties');
    } catch {
      setError('Neizdevās iespējot biometriju.');
      setLoading(false);
    }
  };

  const skip = async () => {
    setLoading(true);
    await setBiometricEnabled(false);
    router.replace('/(app)/(tabs)/properties');
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Biometriskā autentifikācija" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <Text style={styles.text}>
            Lietotne var pieprasīt biometrisku apstiprinājumu pirms līguma failu
            apskates un dzēšanas. Tas pievieno papildu aizsardzības slāni.
          </Text>
          <Text style={styles.text}>
            Šo iestatījumu vēlāk varēsiet mainīt sadaļā Iestatījumi.
          </Text>
        </View>

        <ErrorBanner message={error} />

        <View style={styles.actions}>
          <Button label="Iespējot biometriju" onPress={enable} loading={loading} />
          <Button
            label="Izlaist"
            variant="secondary"
            onPress={skip}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    marginBottom: 24,
    gap: 12,
  },
  text: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
});
