import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const LightRays: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const rays = [
    { angle: -30, delay: 0, width: 80 },
    { angle: 15, delay: 2, width: 50 },
    { angle: -10, delay: 5, width: 100 },
    { angle: 40, delay: 3, width: 60 },
    { angle: -50, delay: 7, width: 70 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {rays.map((ray, i) => {
        const phase = t * 0.15 + ray.delay * 0.5;
        const opacity = Math.max(0, Math.sin(phase) * 0.025 + 0.015);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '-50%',
              left: `${30 + i * 10}%`,
              width: ray.width,
              height: '200%',
              background: 'linear-gradient(180deg, rgba(200,170,255,0) 0%, rgba(200,170,255,1) 40%, rgba(200,170,255,0) 100%)',
              opacity,
              transform: `rotate(${ray.angle}deg)`,
              transformOrigin: 'top center',
            }}
          />
        );
      })}
    </div>
  );
};
