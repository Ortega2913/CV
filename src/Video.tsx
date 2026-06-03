import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Intro} from './scenes/Intro';
import {Scene1Prayer} from './scenes/Scene1Prayer';
import {Scene2RenewMind} from './scenes/Scene2RenewMind';
import {Scene3Accountability} from './scenes/Scene3Accountability';
import {Scene4AvoidTemptation} from './scenes/Scene4AvoidTemptation';
import {Scene5GoodHabits} from './scenes/Scene5GoodHabits';
import {Conclusion} from './scenes/Conclusion';

// Timeline (30fps)
// Intro:        0 - 359   (12s)
// Scene 1:    360 - 899   (18s)
// Scene 2:    900 - 1439  (18s)
// Scene 3:   1440 - 1979  (18s)
// Scene 4:   1980 - 2519  (18s)
// Scene 5:   2520 - 2999  (16s)
// Conclusion:3000 - 3299  (10s)
// Total: 3300 frames = 110 seconds

export const SinningVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#030308'}}>
      <Sequence from={0} durationInFrames={360}>
        <Intro />
      </Sequence>
      <Sequence from={360} durationInFrames={540}>
        <Scene1Prayer />
      </Sequence>
      <Sequence from={900} durationInFrames={540}>
        <Scene2RenewMind />
      </Sequence>
      <Sequence from={1440} durationInFrames={540}>
        <Scene3Accountability />
      </Sequence>
      <Sequence from={1980} durationInFrames={540}>
        <Scene4AvoidTemptation />
      </Sequence>
      <Sequence from={2520} durationInFrames={480}>
        <Scene5GoodHabits />
      </Sequence>
      <Sequence from={3000} durationInFrames={300}>
        <Conclusion />
      </Sequence>
    </AbsoluteFill>
  );
};
