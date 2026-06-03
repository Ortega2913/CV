import React from 'react';
import {useCurrentFrame} from 'remotion';

interface HumanFigureProps {
  pose?: 'kneeling' | 'standing' | 'walking';
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  walkCycle?: number;
}

export const HumanFigure: React.FC<HumanFigureProps> = ({
  pose = 'standing',
  color = '#1A1A2E',
  emissive = '#2D81FF',
  emissiveIntensity = 0,
  walkCycle = 0,
}) => {
  const frame = useCurrentFrame();
  const walkAngle = Math.sin(walkCycle * Math.PI * 2) * 0.4;

  const mat = (
    <meshStandardMaterial
      color={color}
      roughness={0.7}
      metalness={0.1}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  );

  if (pose === 'kneeling') {
    return (
      <group>
        {/* Head */}
        <mesh position={[0, 1.8, 0.1]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          {mat}
        </mesh>
        {/* Torso (bent forward) */}
        <mesh position={[0, 1.1, 0.2]} rotation={[0.8, 0, 0]}>
          <capsuleGeometry args={[0.2, 0.7, 8, 16]} />
          {mat}
        </mesh>
        {/* Upper arms */}
        <mesh position={[-0.35, 1.15, 0.15]} rotation={[1.2, 0, 0.3]}>
          <capsuleGeometry args={[0.1, 0.5, 6, 12]} />
          {mat}
        </mesh>
        <mesh position={[0.35, 1.15, 0.15]} rotation={[1.2, 0, -0.3]}>
          <capsuleGeometry args={[0.1, 0.5, 6, 12]} />
          {mat}
        </mesh>
        {/* Thighs (kneeling) */}
        <mesh position={[-0.2, 0.5, 0.3]} rotation={[1.2, 0, 0]}>
          <capsuleGeometry args={[0.13, 0.5, 6, 12]} />
          {mat}
        </mesh>
        <mesh position={[0.2, 0.5, 0.3]} rotation={[1.2, 0, 0]}>
          <capsuleGeometry args={[0.13, 0.5, 6, 12]} />
          {mat}
        </mesh>
        {/* Lower legs on ground */}
        <mesh position={[-0.2, 0.15, -0.3]} rotation={[0, 0, 0]}>
          <capsuleGeometry args={[0.11, 0.5, 6, 12]} />
          {mat}
        </mesh>
        <mesh position={[0.2, 0.15, -0.3]} rotation={[0, 0, 0]}>
          <capsuleGeometry args={[0.11, 0.5, 6, 12]} />
          {mat}
        </mesh>
      </group>
    );
  }

  if (pose === 'walking') {
    return (
      <group>
        <mesh position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          {mat}
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <capsuleGeometry args={[0.2, 0.7, 8, 16]} />
          {mat}
        </mesh>
        {/* Arms swinging */}
        <mesh position={[-0.38, 1.1, 0]} rotation={[-walkAngle, 0, 0.2]}>
          <capsuleGeometry args={[0.1, 0.55, 6, 12]} />
          {mat}
        </mesh>
        <mesh position={[0.38, 1.1, 0]} rotation={[walkAngle, 0, -0.2]}>
          <capsuleGeometry args={[0.1, 0.55, 6, 12]} />
          {mat}
        </mesh>
        {/* Legs alternating */}
        <mesh position={[-0.2, 0.45, 0]} rotation={[walkAngle * 0.8, 0, 0]}>
          <capsuleGeometry args={[0.13, 0.6, 6, 12]} />
          {mat}
        </mesh>
        <mesh position={[0.2, 0.45, 0]} rotation={[-walkAngle * 0.8, 0, 0]}>
          <capsuleGeometry args={[0.13, 0.6, 6, 12]} />
          {mat}
        </mesh>
      </group>
    );
  }

  // Standing
  return (
    <group>
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        {mat}
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <capsuleGeometry args={[0.2, 0.7, 8, 16]} />
        {mat}
      </mesh>
      <mesh position={[-0.38, 1.05, 0]} rotation={[0.1, 0, 0.15]}>
        <capsuleGeometry args={[0.1, 0.55, 6, 12]} />
        {mat}
      </mesh>
      <mesh position={[0.38, 1.05, 0]} rotation={[-0.1, 0, -0.15]}>
        <capsuleGeometry args={[0.1, 0.55, 6, 12]} />
        {mat}
      </mesh>
      <mesh position={[-0.2, 0.45, 0]}>
        <capsuleGeometry args={[0.13, 0.6, 6, 12]} />
        {mat}
      </mesh>
      <mesh position={[0.2, 0.45, 0]}>
        <capsuleGeometry args={[0.13, 0.6, 6, 12]} />
        {mat}
      </mesh>
    </group>
  );
};
