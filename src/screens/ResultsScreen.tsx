import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { getExercisesByIds } from '../data/exercises';
import { getMovementConfig } from '../data/movements';
import { Finding, Severity } from '../lib/types';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

const SEVERITY_COLOR: Record<Severity, string> = {
  mild: '#f1c40f',
  moderate: '#e67e22',
  notable: '#e74c3c',
};

function FindingCard({
  finding,
  onPressExercise,
}: {
  finding: Finding;
  onPressExercise: (exerciseId: string) => void;
}) {
  const exercises = getExercisesByIds(finding.exerciseIds);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLOR[finding.severity] }]} />
        <Text style={styles.cardTitle}>{finding.title}</Text>
      </View>
      <Text style={styles.cardExplanation}>{finding.explanation}</Text>
      <Text style={styles.exercisesLabel}>Suggested exercises</Text>
      {exercises.map((exercise) => (
        <Pressable
          key={exercise.id}
          style={styles.exerciseRow}
          onPress={() => onPressExercise(exercise.id)}
        >
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseMeta}>{exercise.setsReps}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function ResultsScreen({ route, navigation }: Props) {
  const { session } = route.params;
  const config = getMovementConfig(session.movementType);

  return (
    <View style={styles.container}>
      <FlatList
        data={session.result.findings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{config.label} screen</Text>
            <Text style={styles.subtitle}>
              {session.result.findings.length === 0
                ? 'No notable left/right asymmetry detected in this clip.'
                : `${session.result.findings.length} finding${session.result.findings.length === 1 ? '' : 's'} worth a look.`}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FindingCard
            finding={item}
            onPressExercise={(exerciseId) => navigation.navigate('ExerciseDetail', { exerciseId })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Keep in mind this is a single clip, not a clinical assessment — if you have persistent
            soreness, a physiotherapist can look more closely.
          </Text>
        }
      />
      <Pressable style={styles.doneButton} onPress={() => navigation.popToTop()}>
        <Text style={styles.doneButtonText}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 20, paddingTop: 64, paddingBottom: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  card: {
    backgroundColor: '#f4f6fb',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  severityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', flexShrink: 1 },
  cardExplanation: { fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 10 },
  exercisesLabel: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: 6 },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#dde2ee',
  },
  exerciseName: { fontSize: 14, color: '#1f6feb', fontWeight: '600' },
  exerciseMeta: { fontSize: 13, color: '#888' },
  emptyText: { fontSize: 14, color: '#666', lineHeight: 20, paddingVertical: 12 },
  doneButton: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#1f6feb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
