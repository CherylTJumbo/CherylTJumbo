# Physio Buddy

A cross-platform (iOS + Android) React Native app that records a short video of
you walking, running, squatting, or balancing on one leg, screens it for
left/right movement imbalances, and suggests targeted strengthening/mobility
exercises for whatever it flags.

Built with [Expo](https://expo.dev) (SDK 57) so it runs on both platforms from
one codebase, on your own phone, without native build tooling for day-to-day
development.

## Running it on your phone

1. Install dependencies (already done if you just cloned this):
   ```
   npm install
   ```
2. Start the dev server:
   ```
   npx expo start
   ```
3. Install **Expo Go** from the App Store / Play Store on your phone, then
   scan the QR code printed in the terminal. The app opens directly on your
   device — no cable, no Xcode/Android Studio required for this stage.

Camera recording and picking a video from your library both work in Expo Go.

## How it works

1. **Capture** — pick a movement type (walking, running, squat, single-leg
   balance), then record a short clip or choose one from your library.
2. **Analyze** — the clip is run through a pose estimator that extracts body
   keypoints (hips, knees, ankles, shoulders) per frame.
3. **Screen** — a rule engine (`src/lib/movementAnalysis.ts`) compares left vs.
   right side motion — hip drop, knee tracking, ankle/calf position, shoulder
   height — and flags any that differ enough to be worth a look.
4. **Recommend** — each finding maps to a small set of targeted exercises
   (`src/data/exercises.ts`) with cues, sets/reps, and target muscles.
5. **History** — past sessions are saved on-device (AsyncStorage) so you can
   track findings over time.

## Project structure

```
App.tsx                        entry point, shows the disclaimer once, then the navigator
src/
  navigation/                  React Navigation stack + route param types
  screens/                     Disclaimer, Home, Capture, Analyzing, Results, ExerciseDetail, History
  lib/
    types.ts                   shared types (Keypoint, Finding, Session, ...)
    poseEstimator.ts           pluggable pose-estimation interface (see below)
    movementAnalysis.ts        the left/right symmetry rule engine
    storage.ts                 AsyncStorage-backed session history + onboarding flag
  data/
    movements.ts                movement types + on-screen capture instructions
    exercises.ts                curated exercise library keyed by body region
```

## Pose estimation: currently simulated, by design

`src/lib/poseEstimator.ts` currently ships a `SimulatedPoseEstimator` that
generates a plausible (seeded, repeatable) keypoint sequence per clip, rather
than a real computer-vision model. This was a deliberate choice, not a
shortcut: wiring up an on-device pose model requires a physical phone or
simulator to build and test against, which isn't available in the environment
this was built in. Every other layer of the app — capture, the rule engine,
exercise recommendations, history — is built and fully wired against the
`PoseEstimator` interface, so swapping in a real model is a single-file change
with no other code to touch.

Recommended real implementations, in rough order of effort:

1. **`@tensorflow-models/pose-detection` (MoveNet) + `tfjs-react-native` +
   `expo-gl`** — runs fully on-device, works from a custom dev client
   (`npx expo run:ios` / `npx expo run:android`; not Expo Go). Feed it frames
   sampled from the recorded video and map its 17 COCO keypoints onto this
   app's `Keypoint[]` shape.
2. **`react-native-vision-camera` + a MediaPipe BlazePose frame processor** —
   higher accuracy (33 landmarks, some depth info), best for live-camera
   analysis rather than post-hoc video, but needs native frame-processor glue
   per platform and a dev client / bare workflow.

Both require an actual device or emulator/simulator to build, run, and tune
against, so implementing and validating them is the natural next step once
this scaffold is running on a phone.

## Important limitations

- **This is a wellness/educational screening tool, not a diagnostic one.**
  The disclaimer screen on first launch says this explicitly, and it's worth
  repeating here: it does not diagnose injuries, and the exercise suggestions
  are general strengthening/mobility drills, not a treatment plan.
- The symmetry thresholds in `movementAnalysis.ts` are illustrative
  placeholders, not clinically validated values — they should be tuned (or the
  whole rule engine replaced with a properly trained/validated model) with
  input from a physiotherapist before this is relied on for anything beyond
  a rough self-check.
- Even with a real pose model swapped in, single-camera, single-clip pose
  estimation is good at catching gross asymmetries (e.g., one hip dropping
  more than the other) but is not a substitute for a clinical gait/movement
  assessment.
