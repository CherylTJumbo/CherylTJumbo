import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MOVEMENTS } from '../data/movements';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Physio Buddy</Text>
      <Text style={styles.subtitle}>Pick a movement to screen for imbalances</Text>
      <FlatList
        data={MOVEMENTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('Capture', { movementType: item.id })}
          >
            <Text style={styles.cardTitle}>{item.label}</Text>
            <Text style={styles.cardBody}>{item.instructions}</Text>
          </Pressable>
        )}
      />
      <Pressable style={styles.historyButton} onPress={() => navigation.navigate('History')}>
        <Text style={styles.historyButtonText}>View past sessions</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 64 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 4, marginBottom: 16 },
  list: { paddingBottom: 16 },
  card: {
    backgroundColor: '#f4f6fb',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  cardBody: { fontSize: 14, color: '#555', lineHeight: 20 },
  historyButton: { paddingVertical: 14, alignItems: 'center' },
  historyButtonText: { color: '#1f6feb', fontSize: 15, fontWeight: '600' },
});
