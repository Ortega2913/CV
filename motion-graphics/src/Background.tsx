import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { VIDEO_DURATION_SECS } from './transcript';

const COLOR_STOPS = [
  { pos: 0, colors: ['#0a0014', '#050010', '#000008'] },
  { pos: 0.25, colors: ['#0d0a1a', '#080814', '#030310'] },
  { pos: 0.5, colors: ['#100818', '#070510', '#02020c'] },
  { pos: 0.75, colors: ['#0a0d1a', '#060810', '#02040c'] },
  { pos: 1, colors: ['#0a0014', '#050010', '#000008'] },
];

function lerpColor(c1: string, c2: string, t: number): string {
  const hex = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = hex(c1);
  const [r2, g2, b2] = hex(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps / VIDEO_DURATION_SECS;

  let c1 = COLOR_STOPS[0].colors;
  let c2 = COLOR_STOPS[1].colors;
  let blendT = 0;
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (t >= COLOR_STOPS[i].pos && t <= COLOR_STOPS[i + 1].pos) {
      const range = COLOR_STOPS[i + 1].pos - COLOR_STOPS[i].pos;
      blendT = (t - COLOR_STOPS[i].pos) / range;
      c1 = COLOR_STOPS[i].colors;
      c2 = COLOR_STOPS[i + 1].colors;
      break;
    }
  }

  const top = lerpColor(c1[0], c2[0], blendT);
  const mid = lerpColor(c1[1], c2[1], blendT);
  const bot = lerpColor(c1[2], c2[2], blendT);

  const pulseT = 0.5 + 0.5 * Math.sin(frame / fps * 0.3);
  const glowOpacity = interpolate(pulseT, [0, 1], [0.03, 0.08]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, ${top} 0%, ${mid} 50%, ${bot} 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 30%, rgba(100,70,180,${glowOpacity}) 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.7) 100%)',
        }}
      />
    </div>
  );
};
