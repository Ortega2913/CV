import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { Goliath, David, Army } from '../figures';
import { Title } from '../Title';
import { SCENES } from '../data';

// Scene 5 (38-45s): David victorious over the fallen giant, sunrise breaking
// through, the army of Israel surging forward. Final title.
export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateRight: 'clamp' });
  const opacity = fadeIn; // hold to the end (master fade handles tail)

  const t = frame / fps;
  // sunrise rising
  const sun = interpolate(frame, [0, durationInFrames], [0, 1], { easing: Easing.bezier(0.3, 0, 0.4, 1) });
  // army advancing forward
  const advance = interpolate(frame, [fps * 0.5, durationInFrames], [0, 8], { extrapolateLeft: 'clamp', easing: Easing.bezier(0.4, 0, 0.6, 1) });

  const rays = [-34, -16, 2, 20, 38];

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* sunrise glow at horizon */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 50% 66%, rgba(255,224,150,${0.35 + sun * 0.4}) 0%, rgba(255,180,90,${0.2 + sun * 0.2}) 25%, transparent 60%)`,
        }}
      />
      {/* god-ray light beams from the horizon */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {rays.map((ang, i) => {
          const shimmer = 0.18 + 0.12 * Math.sin(t * 1.1 + i);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '66%',
                width: 60,
                height: '120%',
                transformOrigin: 'top center',
                transform: `translateX(-50%) rotate(${ang + 180}deg)`,
                background: 'linear-gradient(180deg, rgba(255,228,160,0.9) 0%, rgba(255,210,130,0) 75%)',
                opacity: shimmer * sun,
                filter: 'blur(2px)',
              }}
            />
          );
        })}
      </div>

      {/* fallen Goliath, right */}
      <div style={{ position: 'absolute', left: '80%', bottom: '6%', transform: 'translateX(-50%) rotate(88deg)', transformOrigin: 'bottom center', zIndex: 100 }}>
        <Goliath heightPx={500} rim="#6a2a22" flip />
      </div>

      {/* Israelite army surging forward, left */}
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${advance}%)` }}>
        <Army count={11} leftRange={[4, 34]} bottom={16} baseHeight={150} rim="#3a5575" seed={21} frame={frame} fps={fps} cheer />
      </div>

      {/* David, victorious, centre — staff raised */}
      <div style={{ position: 'absolute', left: '48%', bottom: '12%', transform: 'translateX(-50%)', zIndex: 220 }}>
        <David heightPx={250} rim="#ffe08a" armRaise={0.85} />
      </div>

      {/* halo behind David */}
      <div
        style={{
          position: 'absolute',
          left: '48%',
          bottom: '22%',
          transform: 'translate(-50%, 50%)',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,235,170,${0.3 * sun}) 0%, transparent 65%)`,
          zIndex: 210,
        }}
      />

      <Title lines={SCENES[4].title} durationInFrames={durationInFrames} finale />
    </AbsoluteFill>
  );
};
