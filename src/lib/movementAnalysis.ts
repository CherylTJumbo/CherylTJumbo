import { AnalysisResult, BodyRegion, Finding, MovementType, PoseFrame, Severity } from './types';

/**
 * Rule-based symmetry screen. Thresholds below are illustrative placeholders
 * for demo purposes — they have NOT been clinically validated and should be
 * tuned (or replaced with a learned model) with input from a physiotherapist
 * before this is used for anything beyond a wellness/educational screen.
 */
const THRESHOLDS = {
  mild: 0.008,
  moderate: 0.016,
  notable: 0.028,
};

function severityFor(diff: number): Severity | null {
  if (diff >= THRESHOLDS.notable) return 'notable';
  if (diff >= THRESHOLDS.moderate) return 'moderate';
  if (diff >= THRESHOLDS.mild) return 'mild';
  return null;
}

function amplitude(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function series(frames: PoseFrame[], name: string, axis: 'x' | 'y'): number[] {
  return frames.map((f) => {
    const kp = f.keypoints.find((k) => k.name === name);
    return kp ? kp[axis] : 0;
  });
}

interface Metrics {
  hipAmplitude: { left: number; right: number };
  kneeAnkleOffset: { left: number; right: number };
  shoulderY: { left: number; right: number };
}

function computeMetrics(frames: PoseFrame[]): Metrics {
  const leftHipY = series(frames, 'leftHip', 'y');
  const rightHipY = series(frames, 'rightHip', 'y');
  const leftKneeX = series(frames, 'leftKnee', 'x');
  const rightKneeX = series(frames, 'rightKnee', 'x');
  const leftAnkleX = series(frames, 'leftAnkle', 'x');
  const rightAnkleX = series(frames, 'rightAnkle', 'x');
  const leftShoulderY = series(frames, 'leftShoulder', 'y');
  const rightShoulderY = series(frames, 'rightShoulder', 'y');

  const leftOffsets = leftKneeX.map((kx, i) => Math.abs(kx - leftAnkleX[i]));
  const rightOffsets = rightKneeX.map((kx, i) => Math.abs(kx - rightAnkleX[i]));

  return {
    hipAmplitude: { left: amplitude(leftHipY), right: amplitude(rightHipY) },
    kneeAnkleOffset: { left: mean(leftOffsets), right: mean(rightOffsets) },
    shoulderY: { left: mean(leftShoulderY), right: mean(rightShoulderY) },
  };
}

let findingCounter = 0;
function makeFinding(
  region: BodyRegion,
  severity: Severity,
  title: string,
  explanation: string,
  metricValue: number,
  exerciseIds: string[]
): Finding {
  findingCounter += 1;
  return {
    id: `${region}-${findingCounter}`,
    region,
    severity,
    title,
    explanation,
    metricValue,
    exerciseIds,
  };
}

export function analyzeMovement(movementType: MovementType, frames: PoseFrame[]): AnalysisResult {
  const findings: Finding[] = [];

  if (frames.length > 0) {
    const metrics = computeMetrics(frames);

    // Hip drop: the side with the larger vertical hip excursion is doing
    // more compensating work, typically pointing at hip-abductor weakness
    // on that same side (a Trendelenburg-like pattern).
    const hipDiff = Math.abs(metrics.hipAmplitude.left - metrics.hipAmplitude.right);
    const hipSeverity = severityFor(hipDiff);
    if (hipSeverity) {
      const weakerSide = metrics.hipAmplitude.left > metrics.hipAmplitude.right ? 'left' : 'right';
      const region: BodyRegion = weakerSide === 'left' ? 'leftHip' : 'rightHip';
      findings.push(
        makeFinding(
          region,
          hipSeverity,
          `${weakerSide === 'left' ? 'Left' : 'Right'} hip drop during ${movementLabel(movementType)}`,
          `Your pelvis dips more on the ${weakerSide} side than the other during each cycle, which often points to reduced hip abductor (glute medius) control on that side.`,
          hipDiff,
          ['clamshells', 'sideLyingLegRaise', 'singleLegBridge', 'lateralBandWalk']
        )
      );

      // Notable, sustained hip drop is often compensated for through the low back.
      if (hipSeverity === 'notable') {
        findings.push(
          makeFinding(
            'lowerBack',
            'moderate',
            'Possible low-back compensation',
            `The pelvis drop on the ${weakerSide} is large enough that your lower back may be working harder to keep you upright, which can show up as low-back fatigue or soreness after longer sessions.`,
            hipDiff,
            ['birdDog', 'pallofPress', 'sideplank']
          )
        );
      }
    }

    // Knee tracking: larger mean knee-to-ankle horizontal offset on one side
    // suggests that knee is drifting inward/outward relative to the foot.
    const kneeDiff = Math.abs(metrics.kneeAnkleOffset.left - metrics.kneeAnkleOffset.right);
    const kneeSeverity = severityFor(kneeDiff);
    if (kneeSeverity) {
      const affectedSide = metrics.kneeAnkleOffset.left > metrics.kneeAnkleOffset.right ? 'left' : 'right';
      const region: BodyRegion = affectedSide === 'left' ? 'leftKnee' : 'rightKnee';
      findings.push(
        makeFinding(
          region,
          kneeSeverity,
          `${affectedSide === 'left' ? 'Left' : 'Right'} knee tracking asymmetry`,
          `Your ${affectedSide} knee tracks further from your ankle than the other side during ${movementLabel(
            movementType
          )}, which can load the inner or outer knee unevenly over time.`,
          kneeDiff,
          ['terminalKneeExtension', 'lateralBandWalk', 'copenhagenPlank']
        )
      );

      // Knee tracking issues often go hand-in-hand with the calf/ankle,
      // since the foot and ankle set up how the knee travels.
      findings.push(
        makeFinding(
          affectedSide === 'left' ? 'leftCalfAnkle' : 'rightCalfAnkle',
          'mild',
          `${affectedSide === 'left' ? 'Left' : 'Right'} ankle/calf may be compensating`,
          `Uneven knee tracking on the ${affectedSide} is frequently linked to how the ankle and outer calf stabilize the foot — worth strengthening alongside the knee work above.`,
          kneeDiff,
          ['eversionBandWalk', 'singleLegCalfRaise', 'ankleAlphabet']
        )
      );
    }

    // Shoulder tilt: a persistent height difference between shoulders,
    // often a downstream effect of hip/pelvis asymmetry or trunk mobility.
    const shoulderDiff = Math.abs(metrics.shoulderY.left - metrics.shoulderY.right);
    const shoulderSeverity = severityFor(shoulderDiff);
    if (shoulderSeverity) {
      const lowerSide = metrics.shoulderY.left > metrics.shoulderY.right ? 'left' : 'right';
      const region: BodyRegion = lowerSide === 'left' ? 'leftShoulder' : 'rightShoulder';
      findings.push(
        makeFinding(
          region,
          shoulderSeverity,
          `${lowerSide === 'left' ? 'Left' : 'Right'} shoulder sits lower`,
          `Your ${lowerSide} shoulder sits consistently lower through the movement, which can reflect trunk rotation or hip asymmetry higher up the chain.`,
          shoulderDiff,
          ['thoracicRotation', 'scapularRetraction']
        )
      );
    }
  }

  return {
    movementType,
    analyzedAt: Date.now(),
    findings,
    frameCount: frames.length,
  };
}

function movementLabel(movementType: MovementType): string {
  switch (movementType) {
    case 'walking':
      return 'walking';
    case 'running':
      return 'running';
    case 'squat':
      return 'the squat';
    case 'singleLegBalance':
      return 'single-leg balance';
  }
}
