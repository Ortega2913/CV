import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { Goliath, Army } from '../figures';
import { Title } from '../Title';
import { SCENES } from '../data';

// Scene 1 (0-8s): Dark battlefield, the Philistine army, Goliath steps forward.
// Slow low-angle camera push-in.
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 0.6, durationInFrames], [0, 1], { extrapolateLeft: 'clamp' });
  const opacity = fadeIn * (1 - fadeOut);

  // camera push-in on Goliath
  const push = interpolate(frame, [0, durationInFrames], [1, 1.22], { easing: Easing.bezier(0.4, 0, 0.6, 1) });
  // Goliath steps forward (slight) + breath
  const step = interpolate(frame, [fps * 1.5, fps * 4], [0, 14], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.4, 0, 0.6, 1) });
  const breath = 1 + 0.01 * Math.sin(frame / fps * 1.4);

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: '62% 78%' }}>
        {/* Philistine host behind Goliath */}
        <Army count={16} leftRange={[40, 96]} bottom={26} baseHeight={130} rim="#5a2030" seed={5} frame={frame} fps={fps} />

        {/* Goliath, huge and centre-right */}
        <div
          style={{
            position: 'absolute',
            left: `${62 + step / 30}%`,
            bottom: '8%',
            transform: `translateX(-50%) scale(${breath})`,
            zIndex: 200,
          }}
        >
          <Goliath heightPx={560} rim="#c2402e" flip />
        </div>
      </AbsoluteFill>

      <Title lines={SCENES[0].title} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
