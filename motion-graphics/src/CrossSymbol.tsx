import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const CrossSymbol: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const appear = spring({
    frame,
    fps,
    config: { damping: 30, stiffness: 100, mass: 1 },
    durationInFrames: fps * 1.5,
  });

  const breathe = 1 + 0.02 * Math.sin(t * 0.8);
  const glowPulse = 0.3 + 0.2 * Math.sin(t * 1.2);

  return (
    <div
      style={{
        position: 'absolute',
        top: '18%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${appear * breathe})`,
        opacity: appear * 0.12,
        pointerEvents: 'none',
      }}
    >
      <svg width="60" height="80" viewBox="0 0 60 80">
        <rect x="26" y="0" width="8" height="80" rx="2" fill="white" />
        <rect x="6" y="18" width="48" height="8" rx="2" fill="white" />
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <rect x="26" y="0" width="8" height="80" rx="2" fill="rgba(212,175,55,0.6)" filter="url(#glow)" />
        <rect x="6" y="18" width="48" height="8" rx="2" fill="rgba(212,175,55,0.6)" filter="url(#glow)" />
      </svg>
    </div>
  );
};
