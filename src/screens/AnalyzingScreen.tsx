import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { analyzeMovement } from '../lib/movementAnalysis';
import { poseEstimator } from '../lib/poseEstimator';
import { saveSession } from '../lib/storage';
import { Session } from '../lib/types';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Analyzing'>;

export default function AnalyzingScreen({ route, navigation }: Props) {
  const { movementType, videoUri } = route.params;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const frames = await poseEstimator.extractFromVideo(videoUri, movementType);
        const result = analyzeMovement(movementType, frames);
        const session: Session = {
          id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
          createdAt: Date.now(),
          movementType,
          result,
        };
        await saveSession(session);
        if (!cancelled) {
          navigation.replace('Results', { session });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Something went wrong analyzing your clip.');
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [movementType, videoUri, navigation]);

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" color="#1f6feb" />
          <Text style={styles.text}>Analyzing your movement...</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { marginTop: 16, fontSize: 15, color: '#555' },
  errorText: { fontSize: 15, color: '#c0392b', textAlign: 'center' },
});
