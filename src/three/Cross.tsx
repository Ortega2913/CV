import React from 'react';
import {useCurrentFrame} from 'remotion';

interface CrossProps {
  glowIntensity?: number;
  scale?: number;
}

export const Cross: React.FC<CrossProps> = ({glowIntensity = 0.5, scale = 1}) => {
  const frame = useCurrentFrame();
  const pulse = 0.9 + 0.1 * Math.sin(frame * 0.04);

  return (
    <group scale={[scale, scale, scale]}>
      {/* Vertical beam */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.28, 3.6, 0.22]} />
        <meshStandardMaterial
          color="#5C3A1E"
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
      {/* Horizontal beam */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[2.2, 0.28, 0.22]} />
        <meshStandardMaterial
          color="#5C3A1E"
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
      {/* Glow halo behind cross */}
      <mesh position={[0, 0.8, -0.15]}>
        <planeGeometry args={[4, 5]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={glowIntensity * 0.12 * pulse}
          depthWrite={false}
        />
      </mesh>
      {/* Inner glow ring */}
      <mesh position={[0, 0.8, -0.1]} rotation={[0, 0, 0]}>
        <ringGeometry args={[1.5, 2.5, 32]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={glowIntensity * 0.08 * pulse}
          depthWrite={false}
          side={2}
        />
      </mesh>
      {/* Point light for cross glow */}
      <pointLight
        position={[0, 1, 1]}
        color="#FFD700"
        intensity={glowIntensity * 2 * pulse}
        distance={8}
      />
    </group>
  );
};
