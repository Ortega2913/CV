import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { Goliath, David } from '../figures';
import { Title } from '../Title';
import { SCENES } from '../data';

// Scene 4 (28-38s): Slow-motion — David swings the sling, the stone flies,
// strikes Goliath's forehead, and the giant crashes down in a cloud of dust.
export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 0.6, durationInFrames], [0, 1], { extrapolateLeft: 'clamp' });
  const opacity = fadeIn * (1 - fadeOut);

  const SWING_END = fps * 2.5; // release
  const FLIGHT_END = fps * 4; // impact
  const FALL_END = fps * 7.5;

  // Sling whirls around David's hand, then releases.
  const swingSpin = interpolate(frame, [0, SWING_END], [0, 360 * 4], { extrapolateRight: 'clamp' });
  const slingVisible = frame < SWING_END;
  const armRaise = interpolate(frame, [0, SWING_END * 0.5], [0.2, 0.9], { extrapolateRight: 'clamp' });

  // Stone flight (parabolic arc) from David's hand to Goliath's head.
  const flying = frame >= SWING_END && frame <= FLIGHT_END + 4;
  const ft = interpolate(frame, [SWING_END, FLIGHT_END], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const stoneLeft = interpolate(ft, [0, 1], [34, 74]);
  const stoneBottom = 50 + Math.sin(Math.PI * ft) * 16 + (62 - 50) * ft; // arc up, land near head

  // Impact flash.
  const flash = interpolate(frame, [FLIGHT_END, FLIGHT_END + 6, FLIGHT_END + 22], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Goliath falls backward after impact.
  const fallT = interpolate(frame, [FLIGHT_END, FALL_END], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.5, 0, 0.75, 0.2) });
  const fallRot = fallT * 86;
  const hitRecoil = interpolate(frame, [FLIGHT_END, FLIGHT_END + 8], [0, -6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Dust on impact with the ground.
  const dustT = interpolate(frame, [fps * 6, FALL_END + fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Goliath, right side — falls after the hit */}
      <div
        style={{
          position: 'absolute',
          left: `${74 + hitRecoil / 20}%`,
          bottom: '8%',
          transform: `translateX(-50%) rotate(${fallRot}deg)`,
          transformOrigin: 'bottom center',
          zIndex: 120,
        }}
      >
        <Goliath heightPx={520} rim="#b3402e" flip />
      </div>

      {/* dust cloud at the base */}
      {dustT > 0 && (
        <div style={{ position: 'absolute', left: '66%', bottom: '4%', transform: 'translateX(-50%)', zIndex: 130, opacity: 0.8 * (1 - dustT * 0.3) }}>
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI - Math.PI / 2;
            const spread = dustT * 120;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: Math.cos(a) * spread,
                  bottom: Math.abs(Math.sin(a)) * spread * 0.6,
                  width: 50 + dustT * 70,
                  height: 50 + dustT * 70,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(120,100,80,0.5) 0%, transparent 70%)',
                }}
              />
            );
          })}
        </div>
      )}

      {/* David, left — swings and throws */}
      <div style={{ position: 'absolute', left: '30%', bottom: '11%', transform: 'translateX(-50%)', zIndex: 200 }}>
        <David heightPx={220} rim="#ecc874" armRaise={armRaise} />
      </div>

      {/* the sling whirling around David's raised hand */}
      {slingVisible && (
        <div style={{ position: 'absolute', left: '30%', bottom: '40%', transform: `translateX(-50%) rotate(${swingSpin}deg)`, zIndex: 210 }}>
          <svg width="120" height="120" viewBox="-60 -60 120 120" style={{ overflow: 'visible' }}>
            <line x1="0" y1="0" x2="-44" y2="0" stroke="#caa86a" strokeWidth="2" />
            <line x1="0" y1="0" x2="44" y2="0" stroke="#caa86a" strokeWidth="2" />
            <ellipse cx="-50" cy="0" rx="10" ry="6" fill="#2b2f38" stroke="#e7c46a" strokeWidth="1" />
          </svg>
        </div>
      )}

      {/* the flying stone with a motion trail */}
      {flying && (
        <div style={{ position: 'absolute', left: `${stoneLeft}%`, bottom: `${stoneBottom}%`, transform: 'translate(-50%, 50%)', zIndex: 220 }}>
          <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 60, height: 4, background: 'linear-gradient(90deg, transparent, rgba(231,196,106,0.7))', borderRadius: 4 }} />
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#d8d2c4', boxShadow: '0 0 16px rgba(231,196,106,0.9)' }} />
        </div>
      )}

      {/* impact flash */}
      {flash > 0 && (
        <div style={{ position: 'absolute', left: '74%', bottom: '60%', transform: 'translate(-50%, 50%)', zIndex: 230, opacity: flash }}>
          <div style={{ width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,230,150,0.5) 30%, transparent 70%)' }} />
        </div>
      )}

      <Title lines={SCENES[3].title} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
