import { interpolate, spring, SpringConfig } from "remotion";
import * as THREE from "three";

export type CameraKeyframe = {
  frame: number;
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov?: number;
};

const defaultSpring: SpringConfig = {
  damping: 18,
  mass: 1,
  stiffness: 80,
  overshootClamping: false,
};

/**
 * Null Camera Controller — mirrors After Effects null-object camera rigs.
 * Interpolates between keyframes using spring physics for smooth cinematic motion.
 */
export function nullCameraController(
  frame: number,
  fps: number,
  keyframes: CameraKeyframe[]
): { position: THREE.Vector3; target: THREE.Vector3; fov: number } {
  if (keyframes.length === 0) {
    return {
      position: new THREE.Vector3(0, 0, 10),
      target: new THREE.Vector3(0, 0, 0),
      fov: 50,
    };
  }

  if (keyframes.length === 1) {
    return {
      position: keyframes[0].position.clone(),
      target: keyframes[0].target.clone(),
      fov: keyframes[0].fov ?? 50,
    };
  }

  // Find surrounding keyframes
  let fromIndex = 0;
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (frame >= keyframes[i].frame) fromIndex = i;
  }

  const from = keyframes[fromIndex];
  const to = keyframes[Math.min(fromIndex + 1, keyframes.length - 1)];

  if (from === to) {
    return {
      position: from.position.clone(),
      target: from.target.clone(),
      fov: from.fov ?? 50,
    };
  }

  const segmentDuration = to.frame - from.frame;
  const elapsed = frame - from.frame;

  // Spring-based easing for the null controller
  const t = spring({
    frame: elapsed,
    fps,
    config: defaultSpring,
    durationInFrames: segmentDuration,
  });

  const pos = new THREE.Vector3().lerpVectors(from.position, to.position, t);
  const tgt = new THREE.Vector3().lerpVectors(from.target, to.target, t);
  const fov = interpolate(t, [0, 1], [from.fov ?? 50, to.fov ?? 50]);

  return { position: pos, target: tgt, fov };
}
