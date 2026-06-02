import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Goliath, David, Army } from '../figures';
import { Title } from '../Title';
import { Stage, Layer, keys, EASE } from '../camera';
import { SCENES } from '../data';

// Scene 5 (38-45s): camera cranes back and tilts up to reveal the sunrise as
// David stands victorious and the army of Israel surges forward.
export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const opacity = interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateRight: 'clamp', easing: EASE.out });
  const t = frame / fps;

  // Majestic camera: pull back + tilt up to the light.
  const cam = {
    rx: keys(frame, [{ f: 0, v: 7 }, { f: durationInFrames, v: -5, ease: EASE.soft }]),
    ry: keys(frame, [{ f: 0, v: -8 }, { f: 50, v: 0, ease: EASE.out }, { f: durationInFrames, v: 3, ease: EASE.soft }]),
    tz: keys(frame, [{ f: 0, v: 130 }, { f: durationInFrames, v: -210, ease: EASE.soft }]),
  };

  const sun = interpolate(frame, [0, durationInFrames], [0, 1], { easing: EASE.soft });
  const advance = keys(frame, [{ f: fps * 0.5, v: 0 }, { f: durationInFrames, v: 8, ease: EASE.soft }]);
  const rays = [-34, -16, 2, 20, 38];

  return (
    <AbsoluteFill>
      <Stage cam={cam} opacity={opacity}>
        {/* sunrise + god-rays, far */}
        <Layer depth={-420}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse 60% 50% at 50% 66%, rgba(255,224,150,${0.35 + sun * 0.4}) 0%, rgba(255,180,90,${0.2 + sun * 0.2}) 25%, transparent 60%)`,
            }}
          />
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
        </Layer>

        {/* Israelite army surging forward */}
        <Layer depth={-220}>
          <div style={{ position: 'absolute', inset: 0, transform: `translateX(${advance}%)` }}>
            <Army count={11} leftRange={[4, 34]} bottom={16} baseHeight={150} rim="#3a5575" seed={21} frame={frame} fps={fps} cheer />
          </div>
        </Layer>

        {/* fallen Goliath */}
        <Layer depth={40}>
          <div style={{ position: 'absolute', left: '80%', bottom: '6%', transform: 'translateX(-50%) rotate(88deg)', transformOrigin: 'bottom center' }}>
            <Goliath heightPx={500} rim="#6a2a22" flip />
          </div>
        </Layer>

        {/* David victorious + halo */}
        <Layer depth={150}>
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
            }}
          />
          <div style={{ position: 'absolute', left: '48%', bottom: '12%', transform: 'translateX(-50%)' }}>
            <David heightPx={250} rim="#ffe08a" armRaise={0.85} />
          </div>
        </Layer>
      </Stage>

      <Title lines={SCENES[4].title} durationInFrames={durationInFrames} finale />
    </AbsoluteFill>
  );
};
