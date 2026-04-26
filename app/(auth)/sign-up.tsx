import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextInput } from '@/components/TextInput';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError('Lūdzu, aizpildiet visus laukus.');
      return;
    }
    if (password.length < 8) {
      setError('Parolei jābūt vismaz 8 simbolu garai.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Paroles nesakrīt.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUp(email.trim(), password);
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    router.replace('/(auth)/verify-email');
  };

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Izveidot kontu</Text>
      <ErrorBanner message={error} />

      <View style={styles.field}>
        <TextInput
          label="E-pasts"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.field}>
        <TextInput
          label="Parole"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <TextInput
          label="Atkārtot paroli"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <Button label="Reģistrēties" onPress={onSubmit} loading={loading} />

      <View style={styles.links}>
        <Link href="/(auth)/sign-in" style={styles.link}>
          Jau ir konts? Pieteikties
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
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
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
