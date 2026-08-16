export type MovementType = 'walking' | 'running' | 'squat' | 'singleLegBalance';

export type Side = 'left' | 'right';

export type KeypointName =
  | 'nose'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftHip'
  | 'rightHip'
  | 'leftKnee'
  | 'rightKnee'
  | 'leftAnkle'
  | 'rightAnkle'
  | 'leftHeel'
  | 'rightHeel'
  | 'leftFootIndex'
  | 'rightFootIndex';

export interface Keypoint {
  name: KeypointName;
  x: number;
  y: number;
  score: number;
}

/** All keypoints detected in a single video frame, normalized to 0-1 in frame space. */
export interface PoseFrame {
  timestampMs: number;
  keypoints: Keypoint[];
}

export type Severity = 'mild' | 'moderate' | 'notable';

export type BodyRegion =
  | 'leftHip'
  | 'rightHip'
  | 'leftKnee'
  | 'rightKnee'
  | 'leftCalfAnkle'
  | 'rightCalfAnkle'
  | 'lowerBack'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'core';

export interface Finding {
  id: string;
  region: BodyRegion;
  severity: Severity;
  title: string;
  explanation: string;
  metricValue: number;
  exerciseIds: string[];
}

export interface ExerciseRecommendation {
  id: string;
  name: string;
  targetMuscles: string[];
  regions: BodyRegion[];
  cue: string;
  setsReps: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  notes?: string;
}

export interface AnalysisResult {
  movementType: MovementType;
  analyzedAt: number;
  findings: Finding[];
  frameCount: number;
}

export interface Session {
  id: string;
  createdAt: number;
  movementType: MovementType;
  result: AnalysisResult;
}
