import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextInput } from '@/components/TextInput';
import { useAuth } from '@/contexts/AuthContext';
import { tenantsService } from '@/services/tenants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function NewTenantScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!fullName.trim() || !contactInfo.trim()) {
      setError('Lūdzu, aizpildiet visus laukus.');
      return;
    }
    if (!user) {
      setError('Sesija nav pieejama.');
      return;
    }
    setLoading(true);
    try {
      await tenantsService.create(
        { full_name: fullName.trim(), contact_info: contactInfo.trim() },
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
      <ScreenHeader showBack title="Jauns īrnieks" />
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
