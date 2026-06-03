import React from 'react';
import {Composition} from 'remotion';
import {SinningVideo} from './Video';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SinningVideo"
        component={SinningVideo}
        durationInFrames={3300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
