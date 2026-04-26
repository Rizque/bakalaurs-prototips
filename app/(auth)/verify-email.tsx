import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

export default function VerifyEmailScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <Text style={styles.title}>Apstipriniet e-pastu</Text>
      <Text style={styles.body}>
        Uz norādīto e-pasta adresi tika nosūtīta apstiprinājuma saite. Lūdzu,
        atveriet e-pastu un noklikšķiniet uz saites, lai aktivizētu kontu.
      </Text>
      <Text style={styles.body}>
        Pēc apstiprinājuma atgriezieties šajā lietotnē un piesakieties.
      </Text>

      <Button
        label="Atgriezties pie pieteikšanās"
        onPress={() => router.replace('/(auth)/sign-in')}
        style={styles.button}
      />
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
  button: {
    marginTop: 24,
  },
});
