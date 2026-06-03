import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

interface SceneTitleProps {
  number?: string;
  title: string;
  verse?: string;
  verseRef?: string;
  startFrame?: number;
  titleColor?: string;
  accentColor?: string;
}

export const SceneTitle: React.FC<SceneTitleProps> = ({
  number,
  title,
  verse,
  verseRef,
  startFrame = 0,
  titleColor = '#FFD700',
  accentColor = '#C8A84B',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lf = frame - startFrame;

  const titleSpring = spring({frame: lf, fps, config: {damping: 200, stiffness: 80}, from: 0, to: 1});
  const verseSpring = spring({frame: Math.max(lf - 20, 0), fps, config: {damping: 180, stiffness: 70}, from: 0, to: 1});

  const titleOpacity = interpolate(lf, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const verseOpacity = interpolate(lf, [20, 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);
  const verseY = interpolate(verseSpring, [0, 1], [20, 0]);
  const titleScale = interpolate(titleSpring, [0, 1], [0.85, 1]);

  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'flex-start', padding: '0 80px 120px', pointerEvents: 'none'}}>
      <div style={{maxWidth: 900}}>
        {number && (
          <div
            style={{
              fontFamily: 'Cinzel, Georgia, serif',
              fontSize: 22,
              letterSpacing: 6,
              color: accentColor,
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              marginBottom: 8,
              textTransform: 'uppercase',
            }}
          >
            {number}
          </div>
        )}
        <div
          style={{
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: 64,
            fontWeight: 700,
            color: titleColor,
            lineHeight: 1.1,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px) scale(${titleScale})`,
            transformOrigin: 'left bottom',
            textShadow: `0 0 40px ${titleColor}88, 0 2px 4px rgba(0,0,0,0.8)`,
            marginBottom: 20,
            letterSpacing: 1,
          }}
        >
          {title}
        </div>
        {verse && (
          <div
            style={{
              opacity: verseOpacity,
              transform: `translateY(${verseY}px)`,
            }}
          >
            <div
              style={{
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: 22,
                color: '#E8DCC8',
                lineHeight: 1.6,
                maxWidth: 700,
                textShadow: '0 1px 4px rgba(0,0,0,0.9)',
              }}
            >
              "{verse}"
            </div>
            {verseRef && (
              <div
                style={{
                  fontFamily: 'Cinzel, Georgia, serif',
                  fontSize: 16,
                  color: accentColor,
                  marginTop: 8,
                  letterSpacing: 2,
                }}
              >
                — {verseRef}
              </div>
            )}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
