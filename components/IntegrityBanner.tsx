import { useDeviceIntegrity } from '@/contexts/DeviceIntegrityContext';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export function IntegrityBanner() {
  const { compromised, checked } = useDeviceIntegrity();
  if (!checked || !compromised) return null;
  return (
    <View style={styles.container}>
      <Feather name="alert-triangle" size={16} color="#fff" />
      <Text style={styles.text}>
        Atklātas iespējamas root vai jailbreak pazīmes. Sensitīvas darbības var
        nebūt pilnībā aizsargātas.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#cc0000',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  text: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
  },
});
