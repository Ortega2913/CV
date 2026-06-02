import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { Goliath, David } from '../figures';
import { Title } from '../Title';
import { Stage, Layer, keys, shake, EASE } from '../camera';
import { SCENES } from '../data';

// Scene 4 (28-38s): David whirls the sling, the stone flies (slow-mo), strikes
// the giant's forehead. Camera dollies in and kicks on the impact.
export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateRight: 'clamp', easing: EASE.out });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 0.6, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', easing: EASE.in });
  const opacity = Math.min(fadeIn, fadeOut);

  const SWING_END = fps * 2.5; // release (75)
  const FLIGHT_END = fps * 4; // impact (120)
  const FALL_END = fps * 7.5; // 225

  // Camera: orbit in, then dolly toward Goliath and kick on impact.
  const cam = {
    ry: keys(frame, [{ f: 0, v: 15 }, { f: 32, v: 2, ease: EASE.out }, { f: FLIGHT_END, v: 2 }, { f: FLIGHT_END + 14, v: -7, ease: EASE.inOut }, { f: 300, v: -7 }]),
    rx: keys(frame, [{ f: 0, v: 3 }, { f: 300, v: 2 }]),
    tz: keys(frame, [{ f: 0, v: -40 }, { f: 32, v: 20, ease: EASE.out }, { f: FLIGHT_END, v: 20 }, { f: FLIGHT_END + 16, v: 175, ease: EASE.out }, { f: 300, v: 150 }]),
    tx: shake(frame, FLIGHT_END, 20, 1.4, 9),
    ty: shake(frame, FLIGHT_END, 13, 1.7, 9),
    rz: shake(frame, FLIGHT_END, 2.2, 1.2, 10),
  };

  // Sling whirls, then releases.
  const swingSpin = interpolate(frame, [0, SWING_END], [0, 360 * 4], { extrapolateRight: 'clamp' });
  const slingVisible = frame < SWING_END;
  const armRaise = interpolate(frame, [0, SWING_END * 0.5], [0.2, 0.9], { extrapolateRight: 'clamp', easing: EASE.out });

  // Stone flight — smooth parabolic arc to the forehead.
  const flying = frame >= SWING_END && frame <= FLIGHT_END + 4;
  const ft = interpolate(frame, [SWING_END, FLIGHT_END], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut });
  const stoneLeft = interpolate(ft, [0, 1], [34, 74]);
  const stoneBottom = 50 + Math.sin(Math.PI * ft) * 16 + (62 - 50) * ft;

  // Impact flash.
  const flash = interpolate(frame, [FLIGHT_END, FLIGHT_END + 6, FLIGHT_END + 22], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Giant falls with a slight settle.
  const fallRot = keys(frame, [
    { f: FLIGHT_END, v: 0 },
    { f: FALL_END, v: 90, ease: EASE.in },
    { f: FALL_END + 14, v: 85, ease: EASE.out },
    { f: FALL_END + 26, v: 87 },
  ]);
  const hitRecoil = interpolate(frame, [FLIGHT_END, FLIGHT_END + 8], [0, -6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dustT = interpolate(frame, [fps * 6, FALL_END + fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.out });

  return (
    <AbsoluteFill>
      <Stage cam={cam} opacity={opacity}>
        {/* Goliath, right — falls after the hit */}
        <Layer depth={40}>
          <div
            style={{
              position: 'absolute',
              left: `${74 + hitRecoil / 20}%`,
              bottom: '8%',
              transform: `translateX(-50%) rotate(${fallRot}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <Goliath heightPx={520} rim="#b3402e" flip />
          </div>
          {dustT > 0 && (
            <div style={{ position: 'absolute', left: '66%', bottom: '4%', transform: 'translateX(-50%)', opacity: 0.8 * (1 - dustT * 0.3) }}>
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
        </Layer>

        {/* David, left — swings and throws */}
        <Layer depth={170}>
          <div style={{ position: 'absolute', left: '30%', bottom: '11%', transform: 'translateX(-50%)' }}>
            <David heightPx={220} rim="#ecc874" armRaise={armRaise} />
          </div>
          {slingVisible && (
            <div style={{ position: 'absolute', left: '30%', bottom: '40%', transform: `translateX(-50%) rotate(${swingSpin}deg)` }}>
              <svg width="120" height="120" viewBox="-60 -60 120 120" style={{ overflow: 'visible' }}>
                <line x1="0" y1="0" x2="-44" y2="0" stroke="#caa86a" strokeWidth="2" />
                <line x1="0" y1="0" x2="44" y2="0" stroke="#caa86a" strokeWidth="2" />
                <ellipse cx="-50" cy="0" rx="10" ry="6" fill="#2b2f38" stroke="#e7c46a" strokeWidth="1" />
              </svg>
            </div>
          )}
        </Layer>

        {/* flying stone with trail */}
        <Layer depth={210}>
          {flying && (
            <div style={{ position: 'absolute', left: `${stoneLeft}%`, bottom: `${stoneBottom}%`, transform: 'translate(-50%, 50%)' }}>
              <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 60, height: 4, background: 'linear-gradient(90deg, transparent, rgba(231,196,106,0.7))', borderRadius: 4 }} />
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#d8d2c4', boxShadow: '0 0 16px rgba(231,196,106,0.9)' }} />
            </div>
          )}
          {flash > 0 && (
            <div style={{ position: 'absolute', left: '74%', bottom: '60%', transform: 'translate(-50%, 50%)', opacity: flash }}>
              <div style={{ width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,230,150,0.5) 30%, transparent 70%)' }} />
            </div>
          )}
        </Layer>
      </Stage>

      <Title lines={SCENES[3].title} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
