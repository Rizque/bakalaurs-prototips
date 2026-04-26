import { StyleSheet, Text, View } from 'react-native';

type Props = {
  message: string | null;
};

export function ErrorBanner({ message }: Props) {
  if (!message) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#cc0000',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
});
