import { ErrorBanner } from '@/components/ErrorBanner';
import { Field } from '@/components/Field';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { formatDate } from '@/lib/format';
import { tenantsService } from '@/services/tenants';
import { Tenant } from '@/types/database';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

export default function TenantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await tenantsService.getById(id);
      setItem(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kļūda ielādē.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onDelete = () => {
    Alert.alert('Dzēst īrnieku?', 'Šī darbība ir neatgriezeniska.', [
      { text: 'Atcelt', style: 'cancel' },
      {
        text: 'Dzēst',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await tenantsService.remove(id);
            router.back();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Kļūda dzēšot.');
            setBusy(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ScreenContainer>
        <ScreenHeader showBack />
        <LoadingIndicator />
      </ScreenContainer>
    );
  }

  if (!item) {
    return (
      <ScreenContainer>
        <ScreenHeader showBack title="Īrnieks" />
        <ErrorBanner message="Īrnieks nav atrasts." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        showBack
        title={item.full_name}
        rightIcons={[
          {
            icon: 'edit-2',
            accessibilityLabel: 'Rediģēt',
            onPress: () => router.push(`/(app)/(tabs)/tenants/${id}/edit`),
            disabled: busy,
          },
          {
            icon: 'trash-2',
            accessibilityLabel: 'Dzēst',
            variant: 'destructive',
            onPress: onDelete,
            disabled: busy,
          },
        ]}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ErrorBanner message={error} />

        <View style={styles.fields}>
          <Field label="Vārds, uzvārds" value={item.full_name} />
          <Field label="Kontaktinformācija" value={item.contact_info} />
          <Field label="Izveidots" value={formatDate(item.created_at)} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fields: {
    marginBottom: 32,
  },
});
