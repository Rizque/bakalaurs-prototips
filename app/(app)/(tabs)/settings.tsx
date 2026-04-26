import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function SettingsScreen() {
  const { user, biometricEnabled, setBiometricEnabled, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onToggleBiometric = async (value: boolean) => {
    setError(null);
    setBusy(true);
    try {
      if (value) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !enrolled) {
          setError('Šajā ierīcē nav pieejama biometriskā autentifikācija.');
          setBusy(false);
          return;
        }
      }
      await setBiometricEnabled(value);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Iestatījumi" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ErrorBanner message={error} />

        <Section title="Konts">
          <Row label="E-pasts" value={user?.email ?? '—'} />
        </Section>

        <Section title="Drošība">
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Biometriskā autentifikācija</Text>
              <Text style={styles.toggleHelper}>
                Pieprasa biometrisku apstiprinājumu līguma failu apskatei un
                dzēšanai.
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={onToggleBiometric}
              disabled={busy}
              trackColor={{ false: '#ddd', true: '#0066cc' }}
              thumbColor="#fff"
            />
          </View>
        </Section>

        <View style={styles.signOut}>
          <Button
            label="Izrakstīties"
            variant="destructive"
            onPress={() => signOut()}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBody: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  row: {
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  rowValue: {
    fontSize: 16,
    color: '#000',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  toggleHelper: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  signOut: {
    marginTop: 8,
    marginBottom: 24,
  },
});
