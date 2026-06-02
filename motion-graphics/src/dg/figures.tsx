import React from 'react';

const BODY = '#070710';

interface FigureProps {
  heightPx: number;
  rim?: string;
  flip?: boolean; // mirror horizontally (face the other way)
  style?: React.CSSProperties;
}

// Goliath — a massive, armored warrior with helmet crest, spear and shield.
export const Goliath: React.FC<FigureProps> = ({ heightPx, rim = '#b3402e', flip, style }) => {
  return (
    <svg
      width={heightPx * 0.55}
      height={heightPx}
      viewBox="0 0 120 240"
      style={{
        overflow: 'visible',
        filter: `drop-shadow(0 0 14px ${rim})`,
        transform: flip ? 'scaleX(-1)' : undefined,
        ...style,
      }}
    >
      <g fill={BODY}>
        {/* spear (behind) */}
        <line x1="16" y1="14" x2="24" y2="238" stroke={BODY} strokeWidth="6" strokeLinecap="round" />
        <polygon points="16,0 9,22 23,22" />
        {/* legs */}
        <path d="M40,148 L36,236 L56,236 L58,150 Z" />
        <path d="M62,150 L66,236 L86,236 L80,148 Z" />
        {/* kilt */}
        <path d="M32,124 L88,124 L96,168 L24,168 Z" />
        {/* torso armor */}
        <path d="M28,56 L92,56 L86,132 L34,132 Z" />
        {/* pauldrons */}
        <circle cx="32" cy="60" r="13" />
        <circle cx="88" cy="60" r="13" />
        {/* neck + head */}
        <rect x="53" y="42" width="14" height="18" />
        {/* helmet */}
        <path d="M38,32 Q60,4 82,32 L82,46 L38,46 Z" />
        {/* helmet crest / plume — swept fan comb */}
        <path d="M46,32 Q38,6 60,2 Q82,6 74,32 Q60,25 46,32 Z" fill={rim} />
        {/* left arm holding spear */}
        <path d="M28,62 L18,150 L30,152 L42,68 Z" />
        {/* right arm + big round shield */}
        <path d="M92,62 L104,118 L94,122 L80,68 Z" />
        <ellipse cx="104" cy="142" rx="22" ry="38" fill={BODY} stroke={rim} strokeWidth="2.5" />
        <ellipse cx="104" cy="142" rx="9" ry="15" fill={rim} opacity="0.5" />
      </g>
    </svg>
  );
};

// David — a slim shepherd youth holding a staff.
export const David: React.FC<FigureProps & { armRaise?: number }> = ({
  heightPx,
  rim = '#e7c46a',
  flip,
  armRaise = 0,
  style,
}) => {
  return (
    <svg
      width={heightPx * 0.5}
      height={heightPx}
      viewBox="0 0 120 240"
      style={{
        overflow: 'visible',
        filter: `drop-shadow(0 0 10px ${rim})`,
        transform: flip ? 'scaleX(-1)' : undefined,
        ...style,
      }}
    >
      <g fill={BODY}>
        {/* shepherd staff */}
        <path
          d="M40,40 Q34,30 44,28 Q52,28 48,40 L44,238"
          stroke={BODY}
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* head + hair */}
        <circle cx="60" cy="46" r="15" />
        <rect x="55" y="56" width="10" height="14" />
        {/* tunic torso */}
        <path d="M47,64 L73,64 L78,152 L42,152 Z" />
        {/* belt */}
        <rect x="44" y="108" width="32" height="6" fill={rim} opacity="0.55" />
        {/* legs */}
        <path d="M50,150 L45,236 L59,236 L60,152 Z" />
        <path d="M62,152 L64,236 L78,236 L72,150 Z" />
        {/* left arm holding staff */}
        <path d="M48,68 L40,124 L49,126 L57,72 Z" />
        {/* right (throwing) arm — raises with armRaise 0..1 */}
        <g transform={`rotate(${-armRaise * 70} 72 70)`}>
          <path d="M72,68 L84,116 L77,120 L65,72 Z" />
        </g>
      </g>
    </svg>
  );
};

// Generic foot-soldier silhouette (for armies in the background).
export const Soldier: React.FC<FigureProps> = ({ heightPx, rim = '#2a3344', flip, style }) => {
  return (
    <svg
      width={heightPx * 0.55}
      height={heightPx}
      viewBox="0 0 120 220"
      style={{
        overflow: 'visible',
        filter: `drop-shadow(0 0 6px ${rim})`,
        transform: flip ? 'scaleX(-1)' : undefined,
        ...style,
      }}
    >
      <g fill={BODY}>
        {/* spear */}
        <line x1="72" y1="34" x2="78" y2="206" stroke={BODY} strokeWidth="5" strokeLinecap="round" />
        <polygon points="72,22 67,40 78,40" />
        {/* helmet head */}
        <circle cx="50" cy="44" r="13" />
        <path d="M37,40 Q50,30 63,40 L63,46 L37,46 Z" fill={rim} opacity="0.5" />
        {/* torso */}
        <path d="M39,56 L63,56 L67,150 L35,150 Z" />
        {/* legs */}
        <path d="M38,148 L33,206 L46,206 L49,150 Z" />
        <path d="M53,150 L56,206 L69,206 L65,148 Z" />
        {/* arm */}
        <path d="M62,60 L73,118 L66,122 L54,64 Z" />
      </g>
    </svg>
  );
};

function seeded(n: number): number {
  const x = Math.sin(n * 91.7) * 10000;
  return x - Math.floor(x);
}

interface ArmyProps {
  count: number;
  leftRange: [number, number]; // % horizontal band
  bottom: number; // % from bottom for the front row
  rim?: string;
  baseHeight: number; // px height of nearest soldier
  flip?: boolean;
  seed?: number;
  frame: number;
  fps: number;
  cheer?: boolean;
}

// A crowd of soldiers with atmospheric depth (back rows smaller / fainter).
export const Army: React.FC<ArmyProps> = ({
  count,
  leftRange,
  bottom,
  rim = '#27313f',
  baseHeight,
  flip,
  seed = 0,
  frame,
  fps,
  cheer,
}) => {
  const t = frame / fps;
  const soldiers = Array.from({ length: count }, (_, i) => {
    const r1 = seeded(seed + i * 1.3);
    const r2 = seeded(seed + i * 2.7);
    const depth = r2; // 0 near, 1 far
    const left = leftRange[0] + r1 * (leftRange[1] - leftRange[0]);
    const h = baseHeight * (1 - depth * 0.45);
    const b = bottom + depth * 9; // farther rows higher up (toward horizon)
    const op = 1 - depth * 0.55;
    const bob = cheer ? Math.sin(t * 6 + i) * 6 : Math.sin(t * 1.2 + i) * 1.5;
    return { left, h, b, op, bob, z: Math.round((1 - depth) * 100) };
  });

  return (
    <>
      {soldiers.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            bottom: `calc(${s.b}% + ${s.bob}px)`,
            transform: 'translateX(-50%)',
            opacity: s.op,
            zIndex: s.z,
          }}
        >
          <Soldier heightPx={s.h} rim={rim} flip={flip} />
        </div>
      ))}
    </>
  );
};
