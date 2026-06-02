import React from 'react';
import { Composition } from 'remotion';
import { GethsemaneComposition } from './GethsemaneComposition';
import { VIDEO_DURATION_SECS, FPS, WIDTH, HEIGHT } from './transcript';
import { DavidGoliathComposition } from './dg/DavidGoliathComposition';
import {
  VIDEO_DURATION_SECS as DG_DURATION,
  FPS as DG_FPS,
  WIDTH as DG_WIDTH,
  HEIGHT as DG_HEIGHT,
} from './dg/data';

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
      <Composition
        id="DavidGoliath"
        component={DavidGoliathComposition}
        durationInFrames={DG_DURATION * DG_FPS}
        fps={DG_FPS}
        width={DG_WIDTH}
        height={DG_HEIGHT}
      />
    </>
  );
};
