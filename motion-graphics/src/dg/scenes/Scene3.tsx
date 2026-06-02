import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { Goliath, David } from '../figures';
import { Title } from '../Title';
import { SCENES } from '../data';

// Scene 3 (18-28s): Close-up of David picking 5 smooth stones from a stream
// (slow motion), then he advances while Goliath mocks.
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 0.6, durationInFrames], [0, 1], { extrapolateLeft: 'clamp' });
  const opacity = fadeIn * (1 - fadeOut);

  // Phase A: stones close-up (0 - 5.2s). Phase B: approach (4.6 - end).
  const aOut = interpolate(frame, [fps * 4.6, fps * 5.2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bIn = interpolate(frame, [fps * 4.6, fps * 5.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // One stone lifts slowly out of the stream (slow-mo).
  const lift = interpolate(frame, [fps * 1.4, fps * 4.2], [0, -90], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 0, 0.2, 1) });
  const liftScale = interpolate(frame, [fps * 1.4, fps * 4.2], [1, 1.25], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Phase B motion
  const davidLeft = interpolate(frame, [fps * 5.2, durationInFrames], [26, 40], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.45, 0, 0.55, 1) });
  const stride = Math.sin(frame / fps * 4) * 4;
  const laugh = 1 + 0.018 * Math.sin(frame / fps * 9); // Goliath mocking shake

  const stones = [
    { x: 30, y: 4, r: 15 },
    { x: 44, y: 12, r: 13 },
    { x: 56, y: 2, r: 17 },
    { x: 66, y: 14, r: 12 },
    { x: 50, y: 22, r: 14 }, // the one that lifts
  ];

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* ---------- Phase A: stream + stones close-up ---------- */}
      <AbsoluteFill style={{ opacity: aOut }}>
        {/* stream water band */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '46%',
            background: 'linear-gradient(180deg, rgba(40,70,110,0.0) 0%, rgba(40,80,120,0.55) 25%, rgba(20,45,80,0.85) 100%)',
          }}
        />
        {/* ripples */}
        {Array.from({ length: 5 }, (_, i) => {
          const ph = frame / fps * 0.8 + i;
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
        {/* the five stones */}
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
                zIndex: isLift ? 50 : 10,
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
        {/* crouched David reaching */}
        <div style={{ position: 'absolute', left: '78%', bottom: '6%', transform: 'translateX(-50%) scale(1.15)', zIndex: 60 }}>
          <David heightPx={300} rim="#ecc874" armRaise={0.35} />
        </div>
      </AbsoluteFill>

      {/* ---------- Phase B: David advances, Goliath mocks ---------- */}
      <AbsoluteFill style={{ opacity: bIn }}>
        <div style={{ position: 'absolute', left: '82%', bottom: '8%', transform: `translateX(-50%) scale(${laugh})`, transformOrigin: 'bottom center', zIndex: 120 }}>
          <Goliath heightPx={520} rim="#b3402e" flip />
        </div>
        <div
          style={{
            position: 'absolute',
            left: `${davidLeft}%`,
            bottom: `calc(11% + ${stride}px)`,
            transform: 'translateX(-50%)',
            zIndex: 200,
          }}
        >
          <David heightPx={215} rim="#ecc874" />
        </div>
      </AbsoluteFill>

      <Title lines={SCENES[2].title} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
