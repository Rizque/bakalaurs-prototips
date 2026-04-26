import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { PickerModal } from '@/components/PickerModal';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Segmented } from '@/components/Segmented';
import { SelectField } from '@/components/SelectField';
import { TextInput } from '@/components/TextInput';
import { useAuth } from '@/contexts/AuthContext';
import { isValidIsoDate } from '@/lib/format';
import { contractFilesService } from '@/services/contract-files';
import { contractsService } from '@/services/contracts';
import { propertiesService } from '@/services/properties';
import { tenantsService } from '@/services/tenants';
import { ContractStatus, Property, Tenant } from '@/types/database';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

type PickedFile = { uri: string; name: string };

export default function NewContractScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [propertyId, setPropertyId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [status, setStatus] = useState<ContractStatus>('active');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState<PickedFile | null>(null);

  const [showProperty, setShowProperty] = useState(false);
  const [showTenant, setShowTenant] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, t] = await Promise.all([
          propertiesService.list(),
          tenantsService.list(),
        ]);
        setProperties(p);
        setTenants(t);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Kļūda ielādē.');
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  const pickFile = async () => {
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setFile({ uri: asset.uri, name: asset.name });
  };

  const onSubmit = async () => {
    setError(null);
    if (!user) {
      setError('Sesija nav pieejama.');
      return;
    }
    if (!propertyId) {
      setError('Lūdzu, izvēlieties īpašumu.');
      return;
    }
    if (!tenantId) {
      setError('Lūdzu, izvēlieties īrnieku.');
      return;
    }
    if (!isValidIsoDate(startDate)) {
      setError('Sākuma datumam jābūt formātā GGGG-MM-DD.');
      return;
    }
    if (endDate && !isValidIsoDate(endDate)) {
      setError('Beigu datumam jābūt formātā GGGG-MM-DD.');
      return;
    }

    setLoading(true);
    try {
      const contract = await contractsService.create(
        {
          property_id: propertyId,
          tenant_id: tenantId,
          status,
          start_date: startDate,
          end_date: endDate || null,
        },
        user.id
      );
      if (file) {
        await contractFilesService.upload({
          contractId: contract.id,
          userId: user.id,
          localUri: file.uri,
          fileName: file.name,
        });
      }
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kļūda saglabājot.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProperty = properties.find((p) => p.id === propertyId);
  const selectedTenant = tenants.find((t) => t.id === tenantId);

  return (
    <ScreenContainer>
      <ScreenHeader showBack title="Jauns līgums" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ErrorBanner message={error} />

        <View style={styles.field}>
          <SelectField
            label="Īpašums"
            value={selectedProperty?.name}
            onPress={() => setShowProperty(true)}
            disabled={bootstrapping}
          />
        </View>

        <View style={styles.field}>
          <SelectField
            label="Īrnieks"
            value={selectedTenant?.full_name}
            onPress={() => setShowTenant(true)}
            disabled={bootstrapping}
          />
        </View>

        <View style={styles.field}>
          <Segmented
            label="Statuss"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'active', label: 'Aktīvs' },
              { value: 'ended', label: 'Beidzies' },
            ]}
          />
        </View>

        <View style={styles.field}>
          <TextInput
            label="Sākuma datums (GGGG-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
            autoCapitalize="none"
            placeholder="2026-01-01"
          />
        </View>

        <View style={styles.field}>
          <TextInput
            label="Beigu datums (neobligāti)"
            value={endDate}
            onChangeText={setEndDate}
            autoCapitalize="none"
            placeholder="2026-12-31"
          />
        </View>

        <View style={styles.field}>
          <SelectField
            label="PDF fails (neobligāti)"
            value={file?.name}
            placeholder="Izvēlēties failu..."
            onPress={pickFile}
          />
        </View>

        <View style={styles.actions}>
          <Button
            label="Saglabāt"
            onPress={onSubmit}
            loading={loading}
            disabled={bootstrapping}
          />
          <Button
            label="Atcelt"
            variant="secondary"
            onPress={() => router.back()}
            disabled={loading}
          />
        </View>
      </ScrollView>

      <PickerModal
        visible={showProperty}
        title="Izvēlieties īpašumu"
        items={properties.map((p) => ({
          id: p.id,
          label: p.name,
          sub: p.address,
        }))}
        selectedId={propertyId}
        onSelect={(id) => {
          setPropertyId(id);
          setShowProperty(false);
        }}
        onClose={() => setShowProperty(false)}
      />
      <PickerModal
        visible={showTenant}
        title="Izvēlieties īrnieku"
        items={tenants.map((t) => ({
          id: t.id,
          label: t.full_name,
          sub: t.contact_info,
        }))}
        selectedId={tenantId}
        onSelect={(id) => {
          setTenantId(id);
          setShowTenant(false);
        }}
        onClose={() => setShowTenant(false)}
      />
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
