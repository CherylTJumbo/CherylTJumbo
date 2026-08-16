import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getMovementConfig } from '../data/movements';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Capture'>;

export default function CaptureScreen({ route, navigation }: Props) {
  const { movementType } = route.params;
  const config = getMovementConfig(movementType);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const player = useVideoPlayer(videoUri ?? null, (p) => {
    p.loop = true;
  });

  if (!cameraPermission || !micPermission) {
    return <View style={styles.container} />;
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Physio Buddy needs camera and microphone access to record your movement.
        </Text>
        <Pressable
          style={styles.primaryButton}
          onPress={async () => {
            await requestCameraPermission();
            await requestMicPermission();
          }}
        >
          <Text style={styles.primaryButtonText}>Grant access</Text>
        </Pressable>
      </View>
    );
  }

  const onToggleRecording = async () => {
    if (!cameraRef.current) return;
    if (isRecording) {
      cameraRef.current.stopRecording();
      return;
    }
    setIsRecording(true);
    const result = await cameraRef.current.recordAsync({ maxDuration: 15 });
    setIsRecording(false);
    if (result?.uri) {
      setVideoUri(result.uri);
    }
  };

  const onPickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 15,
    });
    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
    }
  };

  if (videoUri) {
    return (
      <View style={styles.container}>
        <VideoView style={styles.preview} player={player} contentFit="cover" />
        <View style={styles.previewActions}>
          <Pressable style={styles.secondaryButton} onPress={() => setVideoUri(null)}>
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </Pressable>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.replace('Analyzing', { movementType, videoUri })}
          >
            <Text style={styles.primaryButtonText}>Analyze this clip</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>{config.instructions}</Text>
      <CameraView ref={cameraRef} style={styles.preview} mode="video" facing="back" />
      <View style={styles.controls}>
        <Pressable
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={onToggleRecording}
        >
          <Text style={styles.recordButtonText}>{isRecording ? 'Stop' : 'Record'}</Text>
        </Pressable>
        {!isRecording && (
          <Pressable style={styles.secondaryButton} onPress={onPickFromLibrary}>
            <Text style={styles.secondaryButtonText}>Choose from library instead</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 56 },
  instructions: { color: '#fff', fontSize: 14, paddingHorizontal: 16, marginBottom: 12 },
  preview: { flex: 1, marginHorizontal: 8, borderRadius: 16, overflow: 'hidden' },
  controls: { padding: 16, alignItems: 'center' },
  recordButton: {
    backgroundColor: '#e0245e',
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  recordButtonActive: { backgroundColor: '#888' },
  recordButtonText: { color: '#fff', fontWeight: '700' },
  previewActions: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, gap: 12 },
  primaryButton: {
    backgroundColor: '#1f6feb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  secondaryButton: { paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  secondaryButtonText: { color: '#9fb8ff', fontSize: 14, fontWeight: '600' },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    padding: 24,
  },
});
