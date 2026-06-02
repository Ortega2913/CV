import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

const PARTICLE_COUNT = 60;

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
  phase: number;
}

const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: seededRandom(i * 7.3) * 100,
  y: seededRandom(i * 3.1) * 100,
  size: seededRandom(i * 5.7) * 3 + 0.5,
  speed: seededRandom(i * 2.9) * 0.008 + 0.002,
  opacity: seededRandom(i * 11.3) * 0.6 + 0.1,
  drift: (seededRandom(i * 4.1) - 0.5) * 0.003,
  phase: seededRandom(i * 6.2) * Math.PI * 2,
}));

export const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p, i) => {
        const y = ((p.y - p.speed * t * 100) % 110) - 5;
        const x = p.x + Math.sin(t * 0.5 + p.phase) * p.drift * 100;
        const twinkle = 0.5 + 0.5 * Math.sin(t * 2 + p.phase);
        const opacity = p.opacity * twinkle;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: i % 5 === 0 ? '#d4af37' : '#ffffff',
              opacity,
              boxShadow: `0 0 ${p.size * 2}px ${p.size}px ${i % 5 === 0 ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.2)'}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </div>
  );
};
