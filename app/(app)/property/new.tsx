import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextInput } from '@/components/TextInput';
import { useAuth } from '@/contexts/AuthContext';
import { propertiesService } from '@/services/properties';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function NewPropertyScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!name.trim() || !address.trim()) {
      setError('Lūdzu, aizpildiet visus laukus.');
      return;
    }
    if (!user) {
      setError('Sesija nav pieejama.');
      return;
    }
    setLoading(true);
    try {
      await propertiesService.create(
        { name: name.trim(), address: address.trim() },
        user.id
      );
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kļūda saglabājot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader showBack title="Jauns īpašums" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ErrorBanner message={error} />

        <View style={styles.field}>
          <TextInput label="Nosaukums" value={name} onChangeText={setName} />
        </View>
        <View style={styles.field}>
          <TextInput
            label="Adrese"
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>

        <View style={styles.actions}>
          <Button label="Saglabāt" onPress={onSubmit} loading={loading} />
          <Button
            label="Atcelt"
            variant="secondary"
            onPress={() => router.back()}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  actions: {
    marginTop: 16,
    gap: 12,
    marginBottom: 24,
  },
});
