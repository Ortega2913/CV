import React from 'react';
import { interpolate, Easing } from 'remotion';

// ---------------------------------------------------------------------------
// After-Effects-style easing presets (CSS cubic-bezier equivalents).
// ---------------------------------------------------------------------------
export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // strong decel — entrances
  inOut: Easing.bezier(0.45, 0, 0.55, 1), // editorial ease-ease
  in: Easing.bezier(0.5, 0, 0.75, 0), // accel — exits
  back: Easing.bezier(0.34, 1.56, 0.64, 1), // overshoot pop
  soft: Easing.bezier(0.33, 0, 0.2, 1), // long smooth glide
};

export interface Key {
  f: number; // frame
  v: number; // value
  ease?: (n: number) => number; // easing INTO this key
}

// Multi-keyframe interpolation with per-segment easing — like AE keyframes.
export function keys(frame: number, points: Key[]): number {
  if (points.length === 0) return 0;
  if (frame <= points[0].f) return points[0].v;
  const last = points[points.length - 1];
  if (frame >= last.f) return last.v;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (frame >= a.f && frame <= b.f) {
      return interpolate(frame, [a.f, b.f], [a.v, b.v], {
        easing: b.ease ?? EASE.inOut,
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }
  }
  return last.v;
}

// Decaying oscillation — camera kick / impact shake.
export function shake(frame: number, start: number, amp: number, freq: number, decay: number): number {
  if (frame < start) return 0;
  const t = frame - start;
  return Math.sin(t * freq) * amp * Math.exp(-t / decay);
}

// ---------------------------------------------------------------------------
// 2.5D camera stage. Children live on parallax depth layers; the camera pose
// (pan / orbit / dolly) is animated per scene to create cinematic angles.
// ---------------------------------------------------------------------------
export const PERSP = 1400;

export interface CameraPose {
  tx?: number; // screen-space pan X (px)
  ty?: number; // screen-space pan Y (px)
  tz?: number; // dolly in(+) / out(-) (px)
  rx?: number; // tilt (deg)
  ry?: number; // orbit (deg)
  rz?: number; // roll (deg)
  scale?: number;
}

export const Stage: React.FC<{
  cam: CameraPose;
  opacity?: number;
  origin?: string;
  children: React.ReactNode;
}> = ({ cam, opacity = 1, origin = '50% 58%', children }) => {
  const { tx = 0, ty = 0, tz = 0, rx = 0, ry = 0, rz = 0, scale = 1 } = cam;
  const transform =
    `translate3d(${tx}px, ${ty}px, 0px) ` +
    `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) ` +
    `translateZ(${tz}px) scale(${scale})`;

  return (
    // flat parent owns opacity + perspective (opacity here does NOT flatten 3D children)
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        perspective: `${PERSP}px`,
        perspectiveOrigin: '50% 46%',
      }}
    >
      {/* the 3D world — must NOT carry opacity/overflow/filter or it flattens */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform,
          transformOrigin: origin,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// A parallax depth layer. Size is compensated so static layout is unchanged;
// depth only affects how the layer parallaxes under camera motion.
export const Layer: React.FC<{ depth: number; children: React.ReactNode }> = ({ depth, children }) => {
  const compensate = (PERSP - depth) / PERSP;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transformStyle: 'preserve-3d',
        transform: `translateZ(${depth}px) scale(${compensate})`,
      }}
    >
      {children}
    </div>
  );
};
