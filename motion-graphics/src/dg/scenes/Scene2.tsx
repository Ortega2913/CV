import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { Goliath, David, Army } from '../figures';
import { Title } from '../Title';
import { SCENES } from '../data';

// Scene 2 (8-18s): Israelite soldiers shrink back; young David walks forward.
// Contrast of small David vs huge Goliath.
export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 0.6, durationInFrames], [0, 1], { extrapolateLeft: 'clamp' });
  const opacity = fadeIn * (1 - fadeOut);

  // Israelites edging backwards (to the left)
  const retreat = interpolate(frame, [0, fps * 4], [0, -3], { extrapolateRight: 'clamp', easing: Easing.bezier(0.4, 0, 0.6, 1) });

  // David walks confidently from the back-left toward the middle
  const davidLeft = interpolate(frame, [fps * 1, fps * 7], [10, 30], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.45, 0, 0.55, 1) });
  const davidScale = interpolate(frame, [fps * 1, fps * 7], [0.7, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const stride = Math.sin(frame / fps * 4) * 4; // walking bob

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Goliath looming, far right */}
      <div style={{ position: 'absolute', left: '84%', bottom: '8%', transform: 'translateX(-50%)', zIndex: 120 }}>
        <Goliath heightPx={520} rim="#a8392b" flip />
      </div>

      {/* Israelite soldiers backing away, mid-left */}
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${retreat}%)` }}>
        <Army count={9} leftRange={[6, 30]} bottom={18} baseHeight={150} rim="#243a52" seed={11} frame={frame} fps={fps} />
      </div>

      {/* David walking forward */}
      <div
        style={{
          position: 'absolute',
          left: `${davidLeft}%`,
          bottom: `calc(11% + ${stride}px)`,
          transform: `translateX(-50%) scale(${davidScale})`,
          zIndex: 200,
        }}
      >
        <David heightPx={210} rim="#ecc874" />
      </div>

      <Title lines={SCENES[1].title} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
