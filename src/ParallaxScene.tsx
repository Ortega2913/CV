import React, { useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Character } from "./Character";
import { nullCameraController, CameraKeyframe } from "./NullCamera";

/**
 * Camera keyframes — mirrors an After Effects null-object camera rig.
 *
 * Phase 1 (0–40):   Wide establishing shot — both characters visible.
 * Phase 2 (40–90):  Camera pushes forward, passing the foreground character.
 * Phase 3 (90–150): Camera arrives at the background character (zoom-in complete).
 */
const KEYFRAMES: CameraKeyframe[] = [
  {
    frame: 0,
    position: new THREE.Vector3(0, 0.4, 9),
    target: new THREE.Vector3(0, 0.2, 0),
    fov: 55,
  },
  {
    frame: 40,
    position: new THREE.Vector3(0, 0.3, 4.5),
    target: new THREE.Vector3(0, 0.2, 0),
    fov: 48,
  },
  {
    frame: 90,
    position: new THREE.Vector3(0, 0.2, 0.5),
    target: new THREE.Vector3(0, 0.2, -6),
    fov: 38,
  },
  {
    frame: 150,
    position: new THREE.Vector3(0, 0.2, -3.5),
    target: new THREE.Vector3(0, 0.2, -6),
    fov: 34,
  },
];

/** Ground plane so depth reads clearly. */
const Ground: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#1a1a2e" />
    </mesh>
  );
};

/** Depth-fog background sphere. */
const Skybox: React.FC = () => (
  <mesh>
    <sphereGeometry args={[30, 32, 32]} />
    <meshBasicMaterial color="#0d0d1a" side={THREE.BackSide} />
  </mesh>
);

/** Floating ambient particles to sell the parallax depth. */
const Particles: React.FC = () => {
  const positions = React.useMemo(() => {
    const pts: [number, number, number][] = [];
    const rng = (n: number) => (Math.sin(n * 127.1) * 0.5 + 0.5) * 2 - 1;
    for (let i = 0; i < 60; i++) {
      pts.push([rng(i) * 8, rng(i + 1) * 3 + 1, rng(i + 2) * 14 - 4]);
    }
    return pts;
  }, []);

  return (
    <>
      {positions.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshBasicMaterial color="#7b8cde" transparent opacity={0.6} />
        </mesh>
      ))}
    </>
  );
};

/** Inner Three.js scene — camera is controlled via ref each frame. */
const Scene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const { position, target, fov } = nullCameraController(
    frame,
    fps,
    KEYFRAMES
  );

  // Apply null-camera values to the Three.js camera every render
  if (cameraRef.current) {
    cameraRef.current.position.copy(position);
    cameraRef.current.lookAt(target);
    cameraRef.current.fov = fov;
    cameraRef.current.updateProjectionMatrix();
  }

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-4, 3, 2]} intensity={0.6} color="#4466ff" />
      <pointLight position={[3, 2, -7]} intensity={0.8} color="#ff6644" />

      <Skybox />
      <Ground />
      <Particles />

      {/* Foreground character — z=0, large scale, warm colour */}
      <Character
        position={[0, 0, 0]}
        color="#e07b39"
        label="foreground"
        scale={1.0}
      />

      {/* Background character — z=-6, slightly smaller, cool colour */}
      <Character
        position={[0, 0, -6]}
        color="#5b9bd5"
        label="background"
        scale={0.85}
      />
    </>
  );
};

export const ParallaxScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const { position, target, fov } = nullCameraController(
    frame,
    fps,
    KEYFRAMES
  );

  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{
        position: [position.x, position.y, position.z],
        fov,
        near: 0.1,
        far: 100,
      }}
    >
      <Scene frame={frame} fps={fps} />
    </ThreeCanvas>
  );
};
