import { Keypoint, KeypointName, MovementType, PoseFrame } from './types';

/**
 * Pluggable on-device pose estimation. Swap `SimulatedPoseEstimator` for a real
 * model without touching any screen or analysis code.
 *
 * Recommended real implementation, in order of effort:
 *  1. @tensorflow-models/pose-detection (MoveNet) + @tensorflow/tfjs-react-native
 *     + expo-gl — runs in a custom dev client (`npx expo run:ios` /
 *     `npx expo run:android`), not in Expo Go. Feed it decoded video frames
 *     or a live camera stream and map its 17 COCO keypoints onto `Keypoint[]`.
 *  2. react-native-vision-camera + a MediaPipe BlazePose frame processor
 *     plugin — highest accuracy (33 landmarks incl. depth), but bare/dev-client
 *     only and needs native plugin glue per platform.
 *
 * Both require a physical device or simulator/emulator to build and test,
 * which isn't available in this sandbox, so this file ships a deterministic
 * simulator instead of untested native ML glue. The rest of the app (capture,
 * analysis, recommendations, history) is fully wired against this interface,
 * so dropping in a real estimator is a single-file change.
 */
export interface PoseEstimator {
  /** Extract a pose per sampled frame from a recorded video. */
  extractFromVideo(videoUri: string, movementType: MovementType): Promise<PoseFrame[]>;
}

const KEYPOINT_NAMES: KeypointName[] = [
  'nose',
  'leftShoulder',
  'rightShoulder',
  'leftHip',
  'rightHip',
  'leftKnee',
  'rightKnee',
  'leftAnkle',
  'rightAnkle',
  'leftHeel',
  'rightHeel',
  'leftFootIndex',
  'rightFootIndex',
];

interface SimulatedProfile {
  /** 0 = perfectly symmetric, 1 = pronounced asymmetry. Seeded from the video uri so repeat analyses on the same clip are stable. */
  asymmetry: number;
  side: 'left' | 'right';
}

function profileFromUri(videoUri: string): SimulatedProfile {
  let hash = 0;
  for (let i = 0; i < videoUri.length; i++) {
    hash = (hash * 31 + videoUri.charCodeAt(i)) >>> 0;
  }
  return {
    asymmetry: 0.15 + (hash % 100) / 130, // ~0.15 - 0.9
    side: hash % 2 === 0 ? 'left' : 'right',
  };
}

/**
 * Generates a plausible keypoint sequence for a movement cycle so the rest of
 * the app (capture -> analyze -> recommend -> history) can be built and
 * demoed end-to-end before a real pose model is wired in. Not derived from
 * actual video pixels.
 */
export class SimulatedPoseEstimator implements PoseEstimator {
  async extractFromVideo(videoUri: string, movementType: MovementType): Promise<PoseFrame[]> {
    const profile = profileFromUri(videoUri);
    const durationMs = movementType === 'squat' || movementType === 'singleLegBalance' ? 4000 : 3000;
    const fps = 15;
    const frameCount = Math.round((durationMs / 1000) * fps);
    const frames: PoseFrame[] = [];

    for (let i = 0; i < frameCount; i++) {
      const t = i / fps;
      frames.push({
        timestampMs: Math.round(t * 1000),
        keypoints: buildKeypointsForFrame(movementType, t, profile),
      });
    }
    return frames;
  }
}

function buildKeypointsForFrame(
  movementType: MovementType,
  t: number,
  profile: SimulatedProfile
): Keypoint[] {
  const cyclesPerSecond = movementType === 'running' ? 1.4 : movementType === 'walking' ? 1.0 : 0.4;
  const phase = t * cyclesPerSecond * 2 * Math.PI;
  const affectedSign = profile.side === 'left' ? 1 : -1;

  const baseHipY = 0.5;
  const hipDrop = 0.02 * Math.sin(phase) * (1 + profile.asymmetry * affectedSign);
  const leftHipY = baseHipY + hipDrop;
  const rightHipY = baseHipY - hipDrop * 0.6;

  const strideSwing = 0.08 * Math.sin(phase);
  const leftKneeX = 0.45 + strideSwing * (1 + profile.asymmetry * 0.3 * (profile.side === 'left' ? -1 : 1));
  const rightKneeX = 0.55 - strideSwing * (1 + profile.asymmetry * 0.3 * (profile.side === 'right' ? -1 : 1));

  const ankleValgus = 0.015 * profile.asymmetry;
  const leftAnkleX = leftKneeX + (profile.side === 'left' ? ankleValgus : 0);
  const rightAnkleX = rightKneeX - (profile.side === 'right' ? ankleValgus : 0);

  const shoulderTilt = 0.01 * profile.asymmetry * affectedSign;

  const points: Record<KeypointName, { x: number; y: number }> = {
    nose: { x: 0.5, y: 0.15 },
    leftShoulder: { x: 0.4, y: 0.28 + shoulderTilt },
    rightShoulder: { x: 0.6, y: 0.28 - shoulderTilt },
    leftHip: { x: 0.45, y: leftHipY },
    rightHip: { x: 0.55, y: rightHipY },
    leftKnee: { x: leftKneeX, y: 0.72 },
    rightKnee: { x: rightKneeX, y: 0.72 },
    leftAnkle: { x: leftAnkleX, y: 0.92 },
    rightAnkle: { x: rightAnkleX, y: 0.92 },
    leftHeel: { x: leftAnkleX - 0.01, y: 0.95 },
    rightHeel: { x: rightAnkleX + 0.01, y: 0.95 },
    leftFootIndex: { x: leftAnkleX + 0.03, y: 0.95 },
    rightFootIndex: { x: rightAnkleX - 0.03, y: 0.95 },
  };

  return KEYPOINT_NAMES.map((name) => ({
    name,
    x: points[name].x,
    y: points[name].y,
    score: 0.9,
  }));
}

export const poseEstimator: PoseEstimator = new SimulatedPoseEstimator();
