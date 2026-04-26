import { Feather } from '@expo/vector-icons';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type PickerItem = { id: string; label: string; sub?: string };

type Props = {
  visible: boolean;
  title: string;
  items: PickerItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function PickerModal({
  visible,
  title,
  items,
  selectedId,
  onSelect,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Feather name="x" size={24} color="#000" />
          </Pressable>
        </View>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nav pieejamu ierakstu.</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedId;
              return (
                <Pressable
                  onPress={() => onSelect(item.id)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{item.label}</Text>
                    {item.sub ? (
                      <Text style={styles.rowSub}>{item.sub}</Text>
                    ) : null}
                  </View>
                  {isSelected ? (
                    <Feather name="check" size={20} color="#0066cc" />
                  ) : null}
                </Pressable>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  pressed: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  rowPressed: {
    backgroundColor: '#f5f5f5',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    color: '#000',
  },
  rowSub: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
  },
});
