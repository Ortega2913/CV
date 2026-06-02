import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

interface TitleProps {
  lines: string[];
  durationInFrames: number;
  finale?: boolean;
}

// Cinematic on-screen title — letter-spaced serif with a gold underline sweep.
export const Title: React.FC<TitleProps> = ({ lines, durationInFrames, finale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 120, mass: 0.9 }, durationInFrames: 24 });
  const exitStart = durationInFrames - fps * 0.6;
  const exit = frame >= exitStart ? interpolate(frame, [exitStart, durationInFrames], [0, 1], { extrapolateRight: 'clamp' }) : 0;

  const opacity = enter * (1 - exit);
  const scale = interpolate(enter, [0, 1], [0.86, 1]);
  const translateY = interpolate(enter, [0, 1], [finale ? 20 : -16, 0]);
  const lineSweep = interpolate(frame, [6, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: finale ? '38%' : '20%',
        textAlign: 'center',
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            color: i === 0 && lines.length > 1 ? '#e7c46a' : '#fbf6ea',
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontWeight: 700,
            fontSize: finale ? (i === 0 ? 44 : 62) : 56,
            letterSpacing: finale && i === 0 ? '0.32em' : '0.06em',
            lineHeight: 1.2,
            textTransform: i === 0 && finale ? 'uppercase' : 'none',
            textShadow: '0 0 28px rgba(231,196,106,0.45), 2px 3px 14px rgba(0,0,0,0.95)',
          }}
        >
          {line}
        </div>
      ))}
      <div
        style={{
          margin: '14px auto 0',
          height: 2,
          width: `${lineSweep * 220}px`,
          maxWidth: '60%',
          background: 'linear-gradient(90deg, transparent, #e7c46a, transparent)',
          boxShadow: '0 0 12px rgba(231,196,106,0.8)',
        }}
      />
    </div>
  );
};
