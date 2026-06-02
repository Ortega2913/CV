import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Goliath, David, Army } from '../figures';
import { Title } from '../Title';
import { Stage, Layer, keys, EASE } from '../camera';
import { SCENES } from '../data';

// Scene 2 (8-18s): camera pans in from the left as the Israelites shrink back
// and young David walks confidently forward. Strong depth contrast.
export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateRight: 'clamp', easing: EASE.out });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 0.6, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', easing: EASE.in });
  const opacity = Math.min(fadeIn, fadeOut);

  // Camera: swing in from the left, then drift to frame Goliath on the right.
  const cam = {
    ry: keys(frame, [{ f: 0, v: -20 }, { f: 44, v: 0, ease: EASE.out }, { f: 300, v: 12, ease: EASE.soft }]),
    rx: keys(frame, [{ f: 0, v: 3 }, { f: 300, v: 1 }]),
    tx: keys(frame, [{ f: 0, v: -70 }, { f: 44, v: 0, ease: EASE.out }, { f: 300, v: 46, ease: EASE.soft }]),
    tz: keys(frame, [{ f: 0, v: -40 }, { f: 300, v: 70, ease: EASE.soft }]),
  };

  // Israelites edging backwards (smooth).
  const retreat = keys(frame, [{ f: 0, v: 0 }, { f: fps * 4, v: -3, ease: EASE.inOut }]);

  // David walks forward — eased path + spring-settled scale, walking bob.
  const davidLeft = keys(frame, [{ f: fps * 1, v: 8 }, { f: fps * 7.5, v: 30, ease: EASE.inOut }]);
  const davidScale = spring({ frame: Math.max(0, frame - fps * 1), fps, config: { damping: 200, stiffness: 60, mass: 1.2 }, durationInFrames: fps * 6 });
  const scale = 0.66 + davidScale * 0.34;
  const stride = Math.sin((frame / fps) * 4) * 4;

  return (
    <AbsoluteFill>
      <Stage cam={cam} opacity={opacity}>
        {/* Goliath looming, far right */}
        <Layer depth={60}>
          <div style={{ position: 'absolute', left: '84%', bottom: '8%', transform: 'translateX(-50%)' }}>
            <Goliath heightPx={520} rim="#a8392b" flip />
          </div>
        </Layer>

        {/* Israelites backing away, mid-left */}
        <Layer depth={-220}>
          <div style={{ position: 'absolute', inset: 0, transform: `translateX(${retreat}%)` }}>
            <Army count={9} leftRange={[6, 30]} bottom={18} baseHeight={150} rim="#243a52" seed={11} frame={frame} fps={fps} />
          </div>
        </Layer>

        {/* David walking forward, closest */}
        <Layer depth={170}>
          <div
            style={{
              position: 'absolute',
              left: `${davidLeft}%`,
              bottom: `calc(11% + ${stride}px)`,
              transform: `translateX(-50%) scale(${scale})`,
              transformOrigin: 'bottom center',
            }}
          >
            <David heightPx={210} rim="#ecc874" />
          </div>
        </Layer>
      </Stage>

      <Title lines={SCENES[1].title} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
