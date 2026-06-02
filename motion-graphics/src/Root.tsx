import React from 'react';
import { Composition } from 'remotion';
import { GethsemaneComposition } from './GethsemaneComposition';
import { VIDEO_DURATION_SECS, FPS, WIDTH, HEIGHT } from './transcript';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GethsemaneMotionGraphics"
        component={GethsemaneComposition}
        durationInFrames={VIDEO_DURATION_SECS * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ audioSrc: undefined }}
      />
    </>
  );
};
