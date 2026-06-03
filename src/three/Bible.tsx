import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeInOutCubic} from '../helpers/easing';

interface BibleProps {
  openProgress?: number;
  glowIntensity?: number;
}

export const Bible: React.FC<BibleProps> = ({openProgress = 0, glowIntensity = 0.5}) => {
  const frame = useCurrentFrame();
  const openAngle = easeInOutCubic(Math.min(openProgress, 1)) * Math.PI * 0.75;
  const pagePulse = 0.8 + 0.2 * Math.sin(frame * 0.05);

  return (
    <group rotation={[-0.3, 0.2, 0]}>
      {/* Back cover */}
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[2.2, 0.12, 2.8]} />
        <meshStandardMaterial color="#1A0A05" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Left page block (rotates open) */}
      <group rotation={[0, -openAngle, 0]} position={[-0.01, 0.07, 0]}>
        <mesh position={[-0.55, 0, 0]}>
          <boxGeometry args={[1.1, 0.04, 2.6]} />
          <meshStandardMaterial
            color="#F5F0E0"
            roughness={0.9}
            emissive="#FFF8E7"
            emissiveIntensity={glowIntensity * openProgress * 0.3 * pagePulse}
          />
        </mesh>
        {/* Text lines on left page */}
        {[0.4, 0.2, 0, -0.2, -0.4, -0.6, -0.8].map((z, i) => (
          <mesh key={i} position={[-0.55, 0.03, z]}>
            <boxGeometry args={[0.85, 0.005, 0.03]} />
            <meshBasicMaterial color="#8B7355" transparent opacity={0.4} />
          </mesh>
        ))}
      </group>
      {/* Right page block */}
      <group rotation={[0, openAngle, 0]} position={[0.01, 0.07, 0]}>
        <mesh position={[0.55, 0, 0]}>
          <boxGeometry args={[1.1, 0.04, 2.6]} />
          <meshStandardMaterial
            color="#F5F0E0"
            roughness={0.9}
            emissive="#FFF8E7"
            emissiveIntensity={glowIntensity * openProgress * 0.3 * pagePulse}
          />
        </mesh>
        {[0.4, 0.2, 0, -0.2, -0.4, -0.6, -0.8].map((z, i) => (
          <mesh key={i} position={[0.55, 0.03, z]}>
            <boxGeometry args={[0.85, 0.005, 0.03]} />
            <meshBasicMaterial color="#8B7355" transparent opacity={0.4} />
          </mesh>
        ))}
      </group>
      {/* Front cover (left half, opens with left pages) */}
      <group rotation={[0, -(openAngle + 0.05), 0]} position={[-0.01, 0, 0]}>
        <mesh position={[-0.55, -0.02, 0]}>
          <boxGeometry args={[1.12, 0.1, 2.82]} />
          <meshStandardMaterial color="#0D0605" roughness={0.6} metalness={0.15} />
        </mesh>
      </group>
      {/* Light beam from open bible */}
      {openProgress > 0.3 && (
        <pointLight
          position={[0, 1.5, 0]}
          color="#FFF8E7"
          intensity={glowIntensity * openProgress * 4 * pagePulse}
          distance={10}
        />
      )}
      <pointLight
        position={[0, 0.5, 1]}
        color="#C8A84B"
        intensity={glowIntensity * 1.5}
        distance={6}
      />
    </group>
  );
};
