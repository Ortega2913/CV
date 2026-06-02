import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { VIDEO_DURATION_SECS } from './data';

// Sky palette key-framed across the 45s story: night -> tense -> storm -> sunrise.
interface Stop {
  pos: number; // 0..1 of the video
  top: string;
  horizon: string;
  ground: string;
  glow: string; // horizon glow color
  glowStrength: number;
}

const STOPS: Stop[] = [
  { pos: 0.0, top: '#04050d', horizon: '#0c1020', ground: '#05060d', glow: '#1a2240', glowStrength: 0.25 },
  { pos: 0.18, top: '#05060f', horizon: '#0e1224', ground: '#06070f', glow: '#1c2748', glowStrength: 0.3 },
  { pos: 0.4, top: '#0a0c1c', horizon: '#1a2138', ground: '#08090f', glow: '#3a4a78', glowStrength: 0.4 },
  { pos: 0.62, top: '#100814', horizon: '#2a1620', ground: '#070406', glow: '#5a2230', glowStrength: 0.5 },
  { pos: 0.78, top: '#1a1020', horizon: '#5a2e2a', ground: '#0a0608', glow: '#b05030', glowStrength: 0.6 },
  { pos: 1.0, top: '#3a2a52', horizon: '#ffb45a', ground: '#2a1c12', glow: '#ffd27a', glowStrength: 1.0 },
];

function hexToRgb(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

function sample(pos: number) {
  let s1 = STOPS[0];
  let s2 = STOPS[1];
  let bt = 0;
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (pos >= STOPS[i].pos && pos <= STOPS[i + 1].pos) {
      s1 = STOPS[i];
      s2 = STOPS[i + 1];
      bt = (pos - s1.pos) / (s2.pos - s1.pos);
      break;
    }
  }
  if (pos >= 1) {
    s1 = STOPS[STOPS.length - 1];
    s2 = s1;
    bt = 0;
  }
  return {
    top: lerpColor(s1.top, s2.top, bt),
    horizon: lerpColor(s1.horizon, s2.horizon, bt),
    ground: lerpColor(s1.ground, s2.ground, bt),
    glow: lerpColor(s1.glow, s2.glow, bt),
    glowStrength: s1.glowStrength + (s2.glowStrength - s1.glowStrength) * bt,
  };
}

const HORIZON = 66; // % from top

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pos = frame / durationInFrames;
  const c = sample(pos);

  // Faint stars fade out as dawn arrives.
  const starOpacity = interpolate(pos, [0, 0.5, 0.78], [0.5, 0.4, 0], { extrapolateRight: 'clamp' });
  const t = frame / fps;

  const stars = Array.from({ length: 40 }, (_, i) => {
    const x = (Math.sin(i * 37.1) * 0.5 + 0.5) * 100;
    const y = (Math.sin(i * 13.7) * 0.5 + 0.5) * HORIZON * 0.9;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i));
    const sz = (Math.sin(i * 7.3) * 0.5 + 0.5) * 1.6 + 0.6;
    return { x, y, tw, sz };
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* sky */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${c.top} 0%, ${c.top} ${HORIZON * 0.45}%, ${c.horizon} ${HORIZON}%, ${c.ground} ${HORIZON + 1}%, ${c.ground} 100%)`,
        }}
      />
      {/* horizon glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 70% 38% at 50% ${HORIZON}%, ${c.glow} 0%, transparent 70%)`,
          opacity: c.glowStrength,
        }}
      />
      {/* stars */}
      <div style={{ position: 'absolute', inset: 0, opacity: starOpacity }}>
        {stars.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.sz,
              height: s.sz,
              borderRadius: '50%',
              backgroundColor: '#cdd6ff',
              opacity: s.tw,
            }}
          />
        ))}
      </div>
      {/* distant hills (two layers) */}
      <svg
        viewBox="0 0 1280 720"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <path
          d={`M0,${720 * (HORIZON / 100)} C 200,${720 * (HORIZON / 100) - 26} 420,${720 * (HORIZON / 100) + 8} 680,${720 * (HORIZON / 100) - 14} C 920,${720 * (HORIZON / 100) - 34} 1120,${720 * (HORIZON / 100) - 4} 1280,${720 * (HORIZON / 100) - 18} L1280,720 L0,720 Z`}
          fill={c.ground}
          opacity={0.85}
        />
        <path
          d={`M0,${720 * (HORIZON / 100) + 10} C 260,${720 * (HORIZON / 100) + 30} 520,${720 * (HORIZON / 100) + 6} 760,${720 * (HORIZON / 100) + 26} C 1000,${720 * (HORIZON / 100) + 44} 1140,${720 * (HORIZON / 100) + 14} 1280,${720 * (HORIZON / 100) + 30} L1280,720 L0,720 Z`}
          fill="#000"
          opacity={0.55}
        />
      </svg>
    </div>
  );
};

export { HORIZON };
