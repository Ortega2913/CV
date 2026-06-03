import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

interface FilmGrainProps {
  opacity?: number;
  animated?: boolean;
}

export const FilmGrain: React.FC<FilmGrainProps> = ({opacity = 0.12, animated = true}) => {
  const frame = useCurrentFrame();
  const seed = animated ? frame % 60 : 0;

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 100}}>
      <svg
        style={{width: '100%', height: '100%', opacity, mixBlendMode: 'overlay'}}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id={`grain-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
