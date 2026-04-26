import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextInput } from '@/components/TextInput';
import { tenantsService } from '@/services/tenants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function EditTenantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const item = await tenantsService.getById(id);
        if (item) {
          setFullName(item.full_name);
          setContactInfo(item.contact_info);
        } else {
          setError('Īrnieks nav atrasts.');
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
    if (!fullName.trim() || !contactInfo.trim()) {
      setError('Lūdzu, aizpildiet visus laukus.');
      return;
    }
    setSaving(true);
    try {
      await tenantsService.update(id, {
        full_name: fullName.trim(),
        contact_info: contactInfo.trim(),
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
      <ScreenHeader showBack title="Rediģēt īrnieku" />
      {loading ? (
        <LoadingIndicator />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ErrorBanner message={error} />

          <View style={styles.field}>
            <TextInput
              label="Vārds, uzvārds"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          <View style={styles.field}>
            <TextInput
              label="Kontaktinformācija"
              value={contactInfo}
              onChangeText={setContactInfo}
              multiline
              placeholder="E-pasts, telefons, u.c."
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
