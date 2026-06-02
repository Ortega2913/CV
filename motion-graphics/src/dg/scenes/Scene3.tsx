import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Goliath, David } from '../figures';
import { Title } from '../Title';
import { Stage, Layer, keys, EASE } from '../camera';
import { SCENES } from '../data';

// Scene 3 (18-28s): camera tilts down over the stream as David lifts a stone
// (slow-mo), then cranes up to eye level as he advances and Goliath mocks.
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateRight: 'clamp', easing: EASE.out });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 0.6, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', easing: EASE.in });
  const opacity = Math.min(fadeIn, fadeOut);

  // Crossfade between the close-up (A) and the approach (B).
  const aOut = interpolate(frame, [fps * 4.6, fps * 5.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut });
  const bIn = interpolate(frame, [fps * 4.6, fps * 5.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut });

  // Camera tilts down for the stones, then cranes up to eye level.
  const cam = {
    rx: keys(frame, [{ f: 0, v: 18 }, { f: 40, v: 13, ease: EASE.out }, { f: 138, v: 13 }, { f: 176, v: 0, ease: EASE.inOut }, { f: 300, v: -2 }]),
    tz: keys(frame, [{ f: 0, v: 120 }, { f: 40, v: 210, ease: EASE.out }, { f: 138, v: 210 }, { f: 180, v: -40, ease: EASE.inOut }, { f: 300, v: 50, ease: EASE.soft }]),
    ry: keys(frame, [{ f: 0, v: 9 }, { f: 176, v: 0, ease: EASE.inOut }, { f: 300, v: -9, ease: EASE.soft }]),
  };

  // One stone lifts slowly out of the stream (slow-mo).
  const lift = keys(frame, [{ f: fps * 1.4, v: 0 }, { f: fps * 4.2, v: -92, ease: EASE.soft }]);
  const liftScale = keys(frame, [{ f: fps * 1.4, v: 1 }, { f: fps * 4.2, v: 1.25, ease: EASE.soft }]);

  // Phase B motion.
  const davidLeft = keys(frame, [{ f: fps * 5.4, v: 26 }, { f: durationInFrames, v: 40, ease: EASE.inOut }]);
  const stride = Math.sin((frame / fps) * 4) * 4;
  const laugh = 1 + 0.018 * Math.sin((frame / fps) * 9);

  const stones = [
    { x: 30, y: 4, r: 15 },
    { x: 44, y: 12, r: 13 },
    { x: 56, y: 2, r: 17 },
    { x: 66, y: 14, r: 12 },
    { x: 50, y: 22, r: 14 },
  ];

  return (
    <AbsoluteFill>
      <Stage cam={cam} opacity={opacity}>
        {/* ----- Phase A: stream + stones close-up ----- */}
        <Layer depth={180}>
          <div style={{ position: 'absolute', inset: 0, opacity: aOut }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '46%',
                background: 'linear-gradient(180deg, rgba(40,70,110,0) 0%, rgba(40,80,120,0.55) 25%, rgba(20,45,80,0.85) 100%)',
              }}
            />
            {Array.from({ length: 5 }, (_, i) => {
              const ph = (frame / fps) * 0.8 + i;
              const w = 30 + 12 * Math.sin(ph);
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${15 + i * 16}%`,
                    bottom: `${10 + (i % 3) * 9}%`,
                    width: `${w}%`,
                    height: 3,
                    borderRadius: 3,
                    background: 'rgba(150,200,255,0.18)',
                  }}
                />
              );
            })}
            {stones.map((s, i) => {
              const isLift = i === stones.length - 1;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${s.x}%`,
                    bottom: `${s.y}%`,
                    transform: isLift ? `translateY(${lift}px) scale(${liftScale})` : 'none',
                  }}
                >
                  <svg width={s.r * 2.4} height={s.r * 1.9} viewBox="0 0 48 38" style={{ filter: isLift ? 'drop-shadow(0 0 14px rgba(231,196,106,0.6))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }}>
                    <ellipse cx="24" cy="20" rx="22" ry="15" fill="#2b2f38" />
                    <ellipse cx="18" cy="14" rx="9" ry="5" fill="#4a505c" opacity="0.7" />
                    {isLift && <ellipse cx="24" cy="20" rx="22" ry="15" fill="none" stroke="#e7c46a" strokeWidth="1.5" opacity="0.8" />}
                  </svg>
                </div>
              );
            })}
            <div style={{ position: 'absolute', left: '78%', bottom: '6%', transform: 'translateX(-50%) scale(1.15)' }}>
              <David heightPx={300} rim="#ecc874" armRaise={0.35} />
            </div>
          </div>
        </Layer>

        {/* ----- Phase B: David advances, Goliath mocks ----- */}
        <Layer depth={50}>
          <div style={{ position: 'absolute', left: '82%', bottom: '8%', transform: `translateX(-50%) scale(${laugh})`, transformOrigin: 'bottom center', opacity: bIn }}>
            <Goliath heightPx={520} rim="#b3402e" flip />
          </div>
        </Layer>
        <Layer depth={175}>
          <div style={{ position: 'absolute', left: `${davidLeft}%`, bottom: `calc(11% + ${stride}px)`, transform: 'translateX(-50%)', opacity: bIn }}>
            <David heightPx={215} rim="#ecc874" />
          </div>
        </Layer>
      </Stage>

      <Title lines={SCENES[2].title} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
