import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Backdrop } from './Backdrop';
import { Caption } from './Caption';
import { Scene1 } from './scenes/Scene1';
import { Scene2 } from './scenes/Scene2';
import { Scene3 } from './scenes/Scene3';
import { Scene4 } from './scenes/Scene4';
import { Scene5 } from './scenes/Scene5';
import { SCENES, CAPTIONS, FPS } from './data';

const SCENE_COMPONENTS = [Scene1, Scene2, Scene3, Scene4, Scene5];

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse 110% 90% at 50% 48%, transparent 55%, rgba(0,0,0,0.55) 100%)',
    }}
  />
);

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const progress = frame / durationInFrames;
  const pulse = 0.6 + 0.4 * Math.sin((frame / fps) * 3);
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.08)' }}>
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, rgba(212,175,55,0.6), rgba(240,200,80,${0.85 * pulse}))`,
          boxShadow: `0 0 8px rgba(240,200,80,${0.5 * pulse})`,
        }}
      />
    </div>
  );
};

export const DavidGoliathComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, fps * 0.7], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 0.8, durationInFrames], [0, 1], { extrapolateLeft: 'clamp' });
  const master = fadeIn * (1 - fadeOut);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', opacity: master }}>
      <Backdrop />

      {SCENES.map((scene, i) => {
        const from = Math.round(scene.start * FPS);
        const dur = Math.round((scene.end - scene.start) * FPS);
        const SceneComp = SCENE_COMPONENTS[i];
        return (
          <Sequence key={scene.id} from={from} durationInFrames={dur}>
            <SceneComp />
          </Sequence>
        );
      })}

      {CAPTIONS.map((cap, i) => {
        const from = Math.round(cap.start * FPS);
        const dur = Math.round((cap.end - cap.start) * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Caption text={cap.text} durationInFrames={dur} />
          </Sequence>
        );
      })}

      <Vignette />
      <ProgressBar />
    </AbsoluteFill>
  );
};
