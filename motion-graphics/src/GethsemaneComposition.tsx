import React from 'react';
import { useCurrentFrame, useVideoConfig, Audio, staticFile, Sequence, interpolate } from 'remotion';
import { Background } from './Background';
import { Particles } from './Particles';
import { LightRays } from './LightRays';
import { CrossSymbol } from './CrossSymbol';
import { AnimatedCaption } from './AnimatedCaption';
import { ProgressBar } from './ProgressBar';
import { TRANSCRIPT_SEGMENTS, FPS } from './transcript';

export const GethsemaneComposition: React.FC<{ audioSrc?: string }> = ({ audioSrc }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeInProgress = interpolate(frame, [0, fps * 0.8], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOutProgress = interpolate(frame, [durationInFrames - fps * 0.8, durationInFrames], [0, 1], { extrapolateLeft: 'clamp' });
  const masterOpacity = fadeInProgress * (1 - fadeOutProgress);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        opacity: masterOpacity,
      }}
    >
      <Background />
      <LightRays />
      <Particles />
      <CrossSymbol />

      <Audio src={staticFile('audio.wav')} />

      {TRANSCRIPT_SEGMENTS.map((seg, i) => {
        const startFrame = Math.round(seg.start * FPS);
        const endFrame = Math.round(seg.end * FPS);
        return (
          <Sequence key={i} from={startFrame} durationInFrames={endFrame - startFrame}>
            <AnimatedCaption
              text={seg.text}
              startFrame={startFrame}
              endFrame={endFrame}
            />
          </Sequence>
        );
      })}

      <ProgressBar />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 120% 80% at 50% 100%, rgba(0,0,0,0.4) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
