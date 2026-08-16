import { MovementType, Session } from '../lib/types';

export type RootStackParamList = {
  Disclaimer: undefined;
  Home: undefined;
  Capture: { movementType: MovementType };
  Analyzing: { movementType: MovementType; videoUri: string };
  Results: { session: Session };
  ExerciseDetail: { exerciseId: string };
  History: undefined;
};
