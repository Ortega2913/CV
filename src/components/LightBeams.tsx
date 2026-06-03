import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {easeInOutCubic} from '../helpers/easing';

interface LightBeamsProps {
  color?: string;
  numBeams?: number;
  opacity?: number;
  startFrame?: number;
}

export const LightBeams: React.FC<LightBeamsProps> = ({
  color = '#FFD700',
  numBeams = 8,
  opacity = 0.25,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const lf = Math.max(frame - startFrame, 0);
  const progress = easeInOutCubic(Math.min(lf / 60, 1));
  const currentOpacity = progress * opacity;

  const beams = Array.from({length: numBeams}, (_, i) => {
    const angle = (i / numBeams) * 360 - 10 + (i % 2 === 0 ? 5 : -5);
    const pulse = 0.85 + 0.15 * Math.sin((frame * 0.03) + i * 0.8);
    return {angle, pulse};
  });

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg style={{width: '100%', height: '100%'}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="beam-fade" cx="50%" cy="0%" r="120%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor={color} stopOpacity={currentOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        {beams.map(({angle, pulse}, i) => (
          <rect
            key={i}
            x="49%"
            y="0"
            width="2%"
            height="100%"
            fill={color}
            opacity={currentOpacity * pulse * 0.5}
            transform={`rotate(${angle}, 960, 0)`}
            style={{transformOrigin: '50% 0%'}}
          />
        ))}
        <rect
          width="100%"
          height="100%"
          fill="url(#beam-fade)"
        />
      </svg>
    </AbsoluteFill>
  );
};
