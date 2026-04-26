import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { FloatingAddButton } from '@/components/FloatingAddButton';
import { ListItem } from '@/components/ListItem';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { propertiesService } from '@/services/properties';
import { Property } from '@/types/database';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList } from 'react-native';

export default function PropertiesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await propertiesService.list();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kļūda ielādē.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScreenContainer>
      <ScreenHeader title="Īpašumi" />
      <ErrorBanner message={error} />

      {loading ? (
        <LoadingIndicator />
      ) : items.length === 0 ? (
        <EmptyState
          title="Nav īpašumu"
          description="Pievienojiet pirmo īpašumu, lai sāktu."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListItem
              title={item.name}
              subtitle={item.address}
              onPress={() => router.push(`/(app)/property/${item.id}`)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FloatingAddButton onPress={() => router.push('/(app)/property/new')} />
    </ScreenContainer>
  );
}
