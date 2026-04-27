import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { PickerModal } from '@/components/PickerModal';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Segmented } from '@/components/Segmented';
import { SelectField } from '@/components/SelectField';
import { TextInput } from '@/components/TextInput';
import {
  displayDateToIso,
  isoToDisplayDate,
  isValidDisplayDate,
} from '@/lib/format';
import { contractsService } from '@/services/contracts';
import { propertiesService } from '@/services/properties';
import { tenantsService } from '@/services/tenants';
import { ContractStatus, Property, Tenant } from '@/types/database';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function EditContractScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [propertyId, setPropertyId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [status, setStatus] = useState<ContractStatus>('active');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [showProperty, setShowProperty] = useState(false);
  const [showTenant, setShowTenant] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [contract, p, t] = await Promise.all([
          contractsService.getById(id),
          propertiesService.list(),
          tenantsService.list(),
        ]);
        setProperties(p);
        setTenants(t);
        if (contract) {
          setPropertyId(contract.property_id);
          setTenantId(contract.tenant_id);
          setStatus(contract.status);
          setStartDate(isoToDisplayDate(contract.start_date));
          setEndDate(isoToDisplayDate(contract.end_date));
        } else {
          setError('Līgums nav atrasts.');
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
    if (!propertyId) {
      setError('Lūdzu, izvēlieties īpašumu.');
      return;
    }
    if (!tenantId) {
      setError('Lūdzu, izvēlieties īrnieku.');
      return;
    }
    if (!isValidDisplayDate(startDate)) {
      setError('Sākuma datumam jābūt formātā DD.MM.GGGG.');
      return;
    }
    if (endDate && !isValidDisplayDate(endDate)) {
      setError('Beigu datumam jābūt formātā DD.MM.GGGG.');
      return;
    }

    setSaving(true);
    try {
      await contractsService.update(id, {
        property_id: propertyId,
        tenant_id: tenantId,
        status,
        start_date: displayDateToIso(startDate),
        end_date: endDate ? displayDateToIso(endDate) : null,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kļūda saglabājot.');
    } finally {
      setSaving(false);
    }
  };

  const selectedProperty = properties.find((p) => p.id === propertyId);
  const selectedTenant = tenants.find((t) => t.id === tenantId);

  return (
    <ScreenContainer>
      <ScreenHeader showBack title="Rediģēt līgumu" />
      {loading ? (
        <LoadingIndicator />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ErrorBanner message={error} />

          <View style={styles.field}>
            <SelectField
              label="Īpašums"
              value={selectedProperty?.name}
              onPress={() => setShowProperty(true)}
            />
          </View>

          <View style={styles.field}>
            <SelectField
              label="Īrnieks"
              value={selectedTenant?.full_name}
              onPress={() => setShowTenant(true)}
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
              label="Sākuma datums (DD.MM.GGGG)"
              value={startDate}
              onChangeText={setStartDate}
              autoCapitalize="none"
              placeholder="01.01.2026"
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <View style={styles.field}>
            <TextInput
              label="Beigu datums (neobligāti)"
              value={endDate}
              onChangeText={setEndDate}
              autoCapitalize="none"
              placeholder="31.12.2026"
              keyboardType="numbers-and-punctuation"
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

      <PickerModal
        visible={showProperty}
        title="Izvēlieties īpašumu"
        items={properties.map((p) => ({
          id: p.id,
          label: p.name,
          sub: p.address,
        }))}
        selectedId={propertyId}
        onSelect={(pid) => {
          setPropertyId(pid);
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
        onSelect={(tid) => {
          setTenantId(tid);
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
