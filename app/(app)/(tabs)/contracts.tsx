import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { FloatingAddButton } from '@/components/FloatingAddButton';
import { ListItem } from '@/components/ListItem';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { formatDate } from '@/lib/format';
import { contractsService } from '@/services/contracts';
import { ContractWithRelations } from '@/types/database';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList } from 'react-native';

function statusLabel(status: string) {
  return status === 'active' ? 'Aktīvs' : 'Beidzies';
}

export default function ContractsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<ContractWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await contractsService.list();
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
      <ScreenHeader title="Līgumi" />
      <ErrorBanner message={error} />

      {loading ? (
        <LoadingIndicator />
      ) : items.length === 0 ? (
        <EmptyState
          title="Nav līgumu"
          description="Pievienojiet pirmo līgumu, lai sāktu."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListItem
              title={`${item.property?.name ?? '—'} · ${item.tenant?.full_name ?? '—'}`}
              subtitle={`${statusLabel(item.status)} · no ${formatDate(item.start_date)}`}
              onPress={() => router.push(`/(app)/contract/${item.id}`)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FloatingAddButton onPress={() => router.push('/(app)/contract/new')} />
    </ScreenContainer>
  );
}
