import { ActivityIndicator, StyleSheet, View } from 'react-native';

type Props = {
  fullscreen?: boolean;
};

export function LoadingIndicator({ fullscreen = false }: Props) {
  return (
    <View style={fullscreen ? styles.fullscreen : styles.inline}>
      <ActivityIndicator size="large" color="#0066cc" />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  inline: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
