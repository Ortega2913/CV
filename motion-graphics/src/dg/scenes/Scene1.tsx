import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Goliath, Army } from '../figures';
import { Title } from '../Title';
import { Stage, Layer, keys, EASE } from '../camera';
import { SCENES } from '../data';

// Scene 1 (0-8s): low-angle camera cranes up to the Philistine host and pushes
// in on Goliath as he steps forward.
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, fps * 0.7], [0, 1], { extrapolateRight: 'clamp', easing: EASE.out });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 0.6, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', easing: EASE.in });
  const opacity = Math.min(fadeIn, fadeOut);

  // Cinematic camera: low angle that settles, slow dolly push-in, exit orbit.
  const cam = {
    rx: keys(frame, [{ f: 0, v: 10 }, { f: 40, v: 5, ease: EASE.out }, { f: 240, v: 3 }]),
    ry: keys(frame, [{ f: 0, v: -12 }, { f: 38, v: 0, ease: EASE.out }, { f: 200, v: 0 }, { f: 240, v: 10, ease: EASE.in }]),
    tz: keys(frame, [{ f: 0, v: -260 }, { f: 240, v: 150, ease: EASE.soft }]),
    tx: keys(frame, [{ f: 0, v: 30 }, { f: 240, v: -26, ease: EASE.soft }]),
  };

  // Goliath steps forward (smooth) with a slow breathing scale.
  const step = keys(frame, [{ f: fps * 1.2, v: 0 }, { f: fps * 5, v: 1, ease: EASE.inOut }]);
  const breath = 1 + 0.012 * Math.sin((frame / fps) * 1.3);

  return (
    <AbsoluteFill>
      <Stage cam={cam} opacity={opacity}>
        {/* Philistine host, far */}
        <Layer depth={-520}>
          <Army count={16} leftRange={[40, 96]} bottom={26} baseHeight={130} rim="#5a2030" seed={5} frame={frame} fps={fps} />
        </Layer>
        {/* Goliath, foreground */}
        <Layer depth={150}>
          <div
            style={{
              position: 'absolute',
              left: `${62 + step * 0.6}%`,
              bottom: '8%',
              transform: `translateX(-50%) scale(${breath})`,
              transformOrigin: 'bottom center',
            }}
          >
            <Goliath heightPx={560} rim="#c2402e" flip />
          </div>
        </Layer>
      </Stage>

      <Title lines={SCENES[0].title} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
