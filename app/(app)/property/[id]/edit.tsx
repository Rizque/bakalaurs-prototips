import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextInput } from '@/components/TextInput';
import { propertiesService } from '@/services/properties';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const item = await propertiesService.getById(id);
        if (item) {
          setName(item.name);
          setAddress(item.address);
        } else {
          setError('Īpašums nav atrasts.');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Kļūda ielādē.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onSubmit = async () => {
    setError(null);
    if (!name.trim() || !address.trim()) {
      setError('Lūdzu, aizpildiet visus laukus.');
      return;
    }
    setSaving(true);
    try {
      await propertiesService.update(id, {
        name: name.trim(),
        address: address.trim(),
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kļūda saglabājot.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader showBack title="Rediģēt īpašumu" />
      {loading ? (
        <LoadingIndicator />
      ) : (
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
            <Button label="Saglabāt" onPress={onSubmit} loading={saving} />
            <Button
              label="Atcelt"
              variant="secondary"
              onPress={() => router.back()}
              disabled={saving}
            />
          </View>
        </ScrollView>
      )}
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
