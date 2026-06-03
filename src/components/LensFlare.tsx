import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {easeInOutCubic} from '../helpers/easing';

interface LensFlareProps {
  x?: number;
  y?: number;
  intensity?: number;
  color?: string;
  startFrame?: number;
  endFrame?: number;
}

export const LensFlare: React.FC<LensFlareProps> = ({
  x = 0.7,
  y = 0.2,
  intensity = 1,
  color = '#FFD700',
  startFrame = 0,
  endFrame = 60,
}) => {
  const frame = useCurrentFrame();

  const rawProgress = (frame - startFrame) / Math.max(endFrame - startFrame, 1);
  const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);
  const easedProgress = easeInOutCubic(clampedProgress);

  const flareOpacity =
    clampedProgress < 0.5
      ? easedProgress * 2 * intensity
      : (1 - easedProgress) * 2 * intensity;

  const px = x * 100;
  const py = y * 100;

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 90}}>
      <svg style={{width: '100%', height: '100%'}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`flare-core-${startFrame}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity={flareOpacity * 0.9} />
            <stop offset="30%" stopColor={color} stopOpacity={flareOpacity * 0.6} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`flare-halo-${startFrame}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity={flareOpacity * 0.3} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Core bright spot */}
        <ellipse
          cx={`${px}%`}
          cy={`${py}%`}
          rx="2%"
          ry="3.5%"
          fill={`url(#flare-core-${startFrame})`}
        />
        {/* Wide halo */}
        <ellipse
          cx={`${px}%`}
          cy={`${py}%`}
          rx="15%"
          ry="25%"
          fill={`url(#flare-halo-${startFrame})`}
        />
        {/* Horizontal streak */}
        <rect
          x="0"
          y={`${py - 0.2}%`}
          width="100%"
          height="0.4%"
          fill={color}
          opacity={flareOpacity * 0.15}
        />
      </svg>
    </AbsoluteFill>
  );
};
