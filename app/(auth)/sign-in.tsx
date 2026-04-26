import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextInput } from '@/components/TextInput';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SignInScreen() {
  const { signIn, session } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace('/(app)');
    }
  }, [session, router]);

  const onSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError('Lūdzu, ievadiet e-pastu un paroli.');
      return;
    }
    setSubmitting(true);
    const { error: signInError } = await signIn(email.trim(), password);
    if (signInError) {
      setSubmitting(false);
      setError(signInError.message);
      return;
    }
    // Loading paliek aktīvs līdz `session` mainās un useEffect veic navigāciju.
  };

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Pieteikties</Text>
      <ErrorBanner message={error} />

      <View style={styles.field}>
        <TextInput
          label="E-pasts"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          onSubmitEditing={onSubmit}
        />
      </View>

      <View style={styles.field}>
        <TextInput
          label="Parole"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
          onSubmitEditing={onSubmit}
        />
      </View>

      <Button label="Pieteikties" onPress={onSubmit} loading={submitting} />

      <View style={styles.links}>
        <Link href="/(auth)/reset-password" style={styles.link}>
          Aizmirsi paroli?
        </Link>
        <Link href="/(auth)/sign-up" style={styles.link}>
          Izveidot kontu
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  field: {
    marginBottom: 16,
  },
  links: {
    marginTop: 24,
    gap: 12,
    alignItems: 'center',
  },
  link: {
    color: '#0066cc',
    fontSize: 14,
  },
});
