import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {easeOutCubic, easeInOutCubic} from '../helpers/easing';

interface TextRevealProps {
  text: string;
  startFrame: number;
  style?: React.CSSProperties;
  delay?: number;
  direction?: 'up' | 'down' | 'scale' | 'fade';
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  startFrame,
  style,
  delay = 0,
  direction = 'up',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const localFrame = frame - startFrame - delay;
  const springVal = spring({
    frame: localFrame,
    fps,
    config: {damping: 180, stiffness: 90, mass: 1.2},
    from: 0,
    to: 1,
  });

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  let transform = '';
  if (direction === 'up') {
    const yOffset = interpolate(springVal, [0, 1], [40, 0]);
    transform = `translateY(${yOffset}px)`;
  } else if (direction === 'down') {
    const yOffset = interpolate(springVal, [0, 1], [-40, 0]);
    transform = `translateY(${yOffset}px)`;
  } else if (direction === 'scale') {
    const scale = interpolate(springVal, [0, 1], [0.7, 1]);
    transform = `scale(${scale})`;
  }

  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        transform,
        ...style,
      }}
    >
      {text}
    </span>
  );
};
