import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { HIGHLIGHT_WORDS } from './data';

interface CaptionProps {
  text: string;
  durationInFrames: number;
}

// Voiceover subtitle with per-word reveal and highlighted keywords.
export const Caption: React.FC<CaptionProps> = ({ text, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exitStart = durationInFrames - Math.min(fps * 0.4, 12);
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 180, mass: 0.7 }, durationInFrames: 16 });
  const exit = frame >= exitStart ? interpolate(frame, [exitStart, durationInFrames], [0, 1], { extrapolateRight: 'clamp' }) : 0;

  const opacity = enter * (1 - exit);
  const translateY = interpolate(enter, [0, 1], [26, 0]);

  const words = text.split(' ').filter((w) => w.length > 0);
  const wordCount = words.length;
  const fontSize = wordCount <= 6 ? 40 : wordCount <= 10 ? 34 : 29;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: '10%',
        textAlign: 'center',
        padding: '0 9%',
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div style={{ display: 'inline', lineHeight: 1.45 }}>
        {words.map((word, idx) => {
          const wEnter = spring({
            frame: Math.max(0, frame - idx * 1.4),
            fps,
            config: { damping: 22, stiffness: 200, mass: 0.5 },
            durationInFrames: 12,
          });
          const clean = word.replace(/[^a-zA-Z]/g, '');
          const hi = HIGHLIGHT_WORDS.has(clean);
          const g = hi ? wEnter : 0;
          return (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                marginRight: '0.28em',
                opacity: wEnter,
                transform: `translateY(${interpolate(wEnter, [0, 1], [10, 0])}px)`,
                color: hi ? '#f0d060' : '#f4f0e8',
                fontWeight: hi ? 700 : 400,
                fontSize,
                fontFamily: '"Georgia", "Times New Roman", serif',
                textShadow: hi
                  ? `0 0 ${18 * g}px rgba(240,200,80,${0.8 * g}), 2px 2px 8px rgba(0,0,0,0.95)`
                  : '2px 2px 8px rgba(0,0,0,0.95), 0 0 16px rgba(0,0,0,0.6)',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
