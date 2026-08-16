import { MovementType } from '../lib/types';

export interface MovementConfig {
  id: MovementType;
  label: string;
  instructions: string;
  minDurationSeconds: number;
}

export const MOVEMENTS: MovementConfig[] = [
  {
    id: 'walking',
    label: 'Walking',
    instructions:
      'Film yourself from the side (or have someone film you) walking at a normal pace for about 10 steps. Keep your full body in frame.',
    minDurationSeconds: 3,
  },
  {
    id: 'running',
    label: 'Running',
    instructions:
      'Film from the side on a treadmill or a straight path at an easy running pace for 5-10 strides, keeping your full body in frame.',
    minDurationSeconds: 3,
  },
  {
    id: 'squat',
    label: 'Squat',
    instructions:
      'Film from the front, feet shoulder-width apart. Perform 3-5 slow bodyweight squats, keeping your whole body in frame.',
    minDurationSeconds: 4,
  },
  {
    id: 'singleLegBalance',
    label: 'Single-Leg Balance',
    instructions:
      'Film from the front. Stand on one leg for 10 seconds, then switch. Keep your hips and both legs in frame throughout.',
    minDurationSeconds: 4,
  },
];

export function getMovementConfig(id: MovementType): MovementConfig {
  const config = MOVEMENTS.find((m) => m.id === id);
  if (!config) {
    throw new Error(`Unknown movement type: ${id}`);
  }
  return config;
}
