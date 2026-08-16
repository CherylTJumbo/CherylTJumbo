import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { acknowledgeDisclaimer } from '../lib/storage';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Disclaimer'>;

export default function DisclaimerScreen({ navigation }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const onAccept = async () => {
    setSubmitting(true);
    await acknowledgeDisclaimer();
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Before you start</Text>
        <Text style={styles.paragraph}>
          Physio Buddy screens your movement for side-to-side imbalances using your phone&apos;s
          camera and on-device motion analysis. It is an educational and wellness tool.
        </Text>
        <Text style={styles.paragraph}>
          It is <Text style={styles.bold}>not</Text> a medical device and does not diagnose
          injuries or conditions. The exercise suggestions are general strength and mobility
          drills, not a treatment plan.
        </Text>
        <Text style={styles.paragraph}>
          Stop any exercise that causes pain, and see a physiotherapist or doctor for persistent,
          worsening, or severe symptoms, or before starting a new exercise routine if you have an
          existing injury.
        </Text>
      </ScrollView>
      <Pressable style={styles.button} onPress={onAccept} disabled={submitting}>
        <Text style={styles.buttonText}>I understand, continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 64 },
  scroll: { paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 16 },
  paragraph: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 16 },
  bold: { fontWeight: '700' },
  button: {
    backgroundColor: '#1f6feb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
