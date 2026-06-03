import React, {useMemo, useRef} from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';

interface ParticleFieldProps {
  count?: number;
  spread?: number;
  color?: string;
  size?: number;
  speed?: number;
  drift?: 'up' | 'down' | 'none';
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 200,
  spread = 20,
  color = '#FFD700',
  size = 0.04,
  speed = 0.3,
  drift = 'up',
}) => {
  const frame = useCurrentFrame();

  const {positions, phases} = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.5;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return {positions: pos, phases: ph};
  }, [count, spread]);

  const animatedPositions = useMemo(() => {
    const pos = new Float32Array(positions);
    const t = frame * 0.016 * speed;
    for (let i = 0; i < count; i++) {
      const phase = phases[i];
      pos[i * 3] += Math.sin(t + phase) * 0.002;
      if (drift === 'up') {
        pos[i * 3 + 1] = (((positions[i * 3 + 1] + spread / 2 + t * 0.5) % spread) - spread / 2);
      } else if (drift === 'down') {
        pos[i * 3 + 1] = (((positions[i * 3 + 1] - spread / 2 - t * 0.5) % spread) + spread / 2);
      }
    }
    return pos;
  }, [frame, positions, phases, count, spread, speed, drift]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={animatedPositions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};
