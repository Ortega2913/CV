import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { VIDEO_DURATION_SECS } from './transcript';

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = VIDEO_DURATION_SECS * fps;
  const progress = frame / totalFrames;

  const glowPulse = 0.6 + 0.4 * Math.sin(frame / fps * 3);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, rgba(212,175,55,0.6), rgba(240,200,80,${0.8 * glowPulse}))`,
          boxShadow: `0 0 8px rgba(240,200,80,${0.5 * glowPulse}), 0 0 20px rgba(212,175,55,${0.3 * glowPulse})`,
          transition: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: `${(1 - progress) * 100}%`,
          top: '50%',
          transform: 'translate(50%, -50%)',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: `rgba(240,200,80,${glowPulse})`,
          boxShadow: `0 0 12px rgba(240,200,80,${glowPulse})`,
        }}
      />
    </div>
  );
};
