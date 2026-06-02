import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

interface AnimatedCaptionProps {
  text: string;
  startFrame: number;
  endFrame: number;
}

const HIGHLIGHT_WORDS = new Set([
  'Jesus', 'Gethsemane', 'Temple', 'God', 'Father', 'mission',
  'communion', 'love', 'prayer', 'obedience', 'strength', 'devotion',
  'surrender', 'intimacy', 'profound', 'vulnerable', 'raw',
]);

export const AnimatedCaption: React.FC<AnimatedCaptionProps> = ({
  text,
  startFrame,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const duration = endFrame - startFrame;
  const localFrame = frame - startFrame;
  const exitStart = duration - Math.min(fps * 0.4, 12);

  const enterProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 180, mass: 0.7 },
    durationInFrames: Math.min(fps * 0.6, 18),
  });

  const exitProgress = localFrame >= exitStart
    ? interpolate(localFrame, [exitStart, duration], [0, 1], { extrapolateRight: 'clamp' })
    : 0;

  const opacity = interpolate(enterProgress, [0, 1], [0, 1]) * (1 - exitProgress);
  const translateY = interpolate(enterProgress, [0, 1], [28, 0]);
  const scale = interpolate(enterProgress, [0, 1], [0.92, 1]) * (1 - exitProgress * 0.05);

  const words = text.split(/(\s+)/);
  const wordCount = words.filter(w => w.trim()).length;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: '12%',
        textAlign: 'center',
        padding: '0 8%',
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transformOrigin: 'center bottom',
      }}
    >
      <div
        style={{
          display: 'inline',
          lineHeight: 1.45,
          letterSpacing: '0.01em',
        }}
      >
        {words.map((word, i) => {
          const isSpace = /^\s+$/.test(word);
          if (isSpace) return <span key={i}>{word}</span>;

          const wordIndex = words.slice(0, i).filter(w => w.trim()).length;
          const wordDelay = wordIndex * 1.5;
          const wordEnter = spring({
            frame: Math.max(0, localFrame - wordDelay),
            fps,
            config: { damping: 22, stiffness: 200, mass: 0.5 },
            durationInFrames: 12,
          });

          const cleanWord = word.replace(/[^a-zA-Z]/g, '');
          const isHighlight = HIGHLIGHT_WORDS.has(cleanWord);

          const wordOpacity = interpolate(wordEnter, [0, 1], [0, 1]);
          const wordSlide = interpolate(wordEnter, [0, 1], [12, 0]);

          const glowIntensity = isHighlight ? interpolate(wordEnter, [0, 1], [0, 1]) : 0;

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: wordOpacity,
                transform: `translateY(${wordSlide}px)`,
                color: isHighlight ? '#f0d060' : '#ffffff',
                textShadow: isHighlight
                  ? `0 0 ${20 * glowIntensity}px rgba(240,200,80,${0.8 * glowIntensity}), 0 0 ${40 * glowIntensity}px rgba(240,200,80,${0.4 * glowIntensity}), 2px 2px 8px rgba(0,0,0,0.9)`
                  : '2px 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)',
                fontWeight: isHighlight ? 700 : 400,
                fontSize: wordCount <= 6 ? 44 : wordCount <= 10 ? 38 : 32,
                fontFamily: '"Georgia", "Times New Roman", serif',
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
