import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';

interface DoveProps {
  flapSpeed?: number;
  color?: string;
}

export const Dove: React.FC<DoveProps> = ({flapSpeed = 1, color = '#FFFFFF'}) => {
  const frame = useCurrentFrame();
  const flapAngle = Math.sin(frame * flapSpeed * 0.25) * 0.6;

  const mat = (
    <meshStandardMaterial
      color={color}
      roughness={0.3}
      metalness={0.0}
      emissive={color}
      emissiveIntensity={0.15}
    />
  );

  return (
    <group>
      {/* Body */}
      <mesh rotation={[0.2, 0, 0]}>
        <capsuleGeometry args={[0.18, 0.55, 8, 16]} />
        {mat}
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.22, 0.35]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        {mat}
      </mesh>
      {/* Beak */}
      <mesh position={[0, 0.2, 0.5]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.04, 0.12, 6]} />
        <meshStandardMaterial color="#E8C060" roughness={0.5} />
      </mesh>
      {/* Left wing */}
      <mesh position={[-0.55, 0, 0]} rotation={[0, 0.1, flapAngle]}>
        <group>
          <mesh>
            <boxGeometry args={[0.7, 0.04, 0.35]} />
            {mat}
          </mesh>
          <mesh position={[-0.5, 0, -0.1]} rotation={[0, 0, flapAngle * 0.5]}>
            <boxGeometry args={[0.5, 0.03, 0.3]} />
            {mat}
          </mesh>
        </group>
      </mesh>
      {/* Right wing */}
      <mesh position={[0.55, 0, 0]} rotation={[0, -0.1, -flapAngle]}>
        <group>
          <mesh>
            <boxGeometry args={[0.7, 0.04, 0.35]} />
            {mat}
          </mesh>
          <mesh position={[0.5, 0, -0.1]} rotation={[0, 0, -flapAngle * 0.5]}>
            <boxGeometry args={[0.5, 0.03, 0.3]} />
            {mat}
          </mesh>
        </group>
      </mesh>
      {/* Tail */}
      <mesh position={[0, -0.05, -0.4]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.22, 0.03, 0.3]} />
        {mat}
      </mesh>
    </group>
  );
};
