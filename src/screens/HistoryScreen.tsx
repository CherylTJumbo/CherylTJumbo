import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { getMovementConfig } from '../data/movements';
import { loadSessions } from '../lib/storage';
import { Session } from '../lib/types';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadSessions().then(setSessions);
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.title}>Past sessions</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>No sessions yet — analyze a clip from the home screen.</Text>}
        renderItem={({ item }) => {
          const config = getMovementConfig(item.movementType);
          const date = new Date(item.createdAt);
          return (
            <Pressable style={styles.row} onPress={() => navigation.navigate('Results', { session: item })}>
              <View>
                <Text style={styles.rowTitle}>{config.label}</Text>
                <Text style={styles.rowSubtitle}>{date.toLocaleDateString()} {date.toLocaleTimeString()}</Text>
              </View>
              <Text style={styles.rowCount}>{item.result.findings.length} finding{item.result.findings.length === 1 ? '' : 's'}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 20, paddingTop: 64 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  emptyText: { fontSize: 14, color: '#666', lineHeight: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f4f6fb',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowSubtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  rowCount: { fontSize: 13, color: '#1f6feb', fontWeight: '600' },
});
