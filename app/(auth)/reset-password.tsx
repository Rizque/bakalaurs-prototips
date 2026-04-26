import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextInput } from '@/components/TextInput';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ResetPasswordScreen() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email) {
      setError('Lūdzu, ievadiet e-pastu.');
      return;
    }
    setLoading(true);
    const { error: resetError } = await resetPassword(email.trim());
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>E-pasts nosūtīts</Text>
        <Text style={styles.body}>
          Ja konts ar šo e-pastu eksistē, uz to tika nosūtīta paroles
          atiestatīšanas saite. Lūdzu, atveriet e-pastu un sekojiet
          norādījumiem.
        </Text>
        <Button
          label="Atgriezties pie pieteikšanās"
          onPress={() => router.replace('/(auth)/sign-in')}
          style={styles.button}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Atiestatīt paroli</Text>
      <Text style={styles.body}>
        Ievadiet e-pastu, ar kuru reģistrējāties. Mēs nosūtīsim atiestatīšanas
        saiti.
      </Text>
      <ErrorBanner message={error} />

      <View style={styles.field}>
        <TextInput
          label="E-pasts"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <Button label="Nosūtīt saiti" onPress={onSubmit} loading={loading} />

      <View style={styles.links}>
        <Link href="/(auth)/sign-in" style={styles.link}>
          Atpakaļ uz pieteikšanos
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
    lineHeight: 22,
  },
  field: {
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
  },
  links: {
    marginTop: 24,
    alignItems: 'center',
  },
  link: {
    color: '#0066cc',
    fontSize: 14,
  },
});
