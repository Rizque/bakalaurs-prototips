import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title?: string;
  showBack?: boolean;
  rightAction?: { label: string; onPress: () => void };
};

export function ScreenHeader({ title, showBack = false, rightAction }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.left}>
          {showBack ? (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            >
              <Feather name="chevron-left" size={20} color="#000" />
              <Text style={styles.backText}>Atpakaļ</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.right}>
          {rightAction ? (
            <Pressable
              onPress={rightAction.onPress}
              hitSlop={12}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.action}>{rightAction.label}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: -4,
  },
  backText: {
    color: '#000',
    fontSize: 16,
  },
  action: {
    color: '#0066cc',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    letterSpacing: -0.3,
  },
});
