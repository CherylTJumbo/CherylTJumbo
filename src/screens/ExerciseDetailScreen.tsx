import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EXERCISES } from '../data/exercises';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseDetail'>;

export default function ExerciseDetailScreen({ route }: Props) {
  const exercise = EXERCISES.find((e) => e.id === route.params.exerciseId);

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text>Exercise not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{exercise.name}</Text>
      <View style={styles.badgeRow}>
        <Text style={styles.badge}>{exercise.difficulty}</Text>
        <Text style={styles.setsReps}>{exercise.setsReps}</Text>
      </View>

      <Text style={styles.sectionLabel}>Target muscles</Text>
      <Text style={styles.sectionBody}>{exercise.targetMuscles.join(', ')}</Text>

      <Text style={styles.sectionLabel}>How to do it</Text>
      <Text style={styles.sectionBody}>{exercise.cue}</Text>

      {exercise.notes && (
        <>
          <Text style={styles.sectionLabel}>Why it helps</Text>
          <Text style={styles.sectionBody}>{exercise.notes}</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  badge: {
    backgroundColor: '#eef2ff',
    color: '#1f6feb',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  setsReps: { fontSize: 14, color: '#555', fontWeight: '600' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', marginTop: 16, marginBottom: 6 },
  sectionBody: { fontSize: 15, lineHeight: 22, color: '#333' },
});
