import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Cross} from '../three/Cross';
import {Dove} from '../three/Dove';
import {ParticleField} from '../three/ParticleField';
import {CameraController} from '../three/CameraController';
import {FilmGrain} from '../components/FilmGrain';
import {LensFlare} from '../components/LensFlare';
import {LightBeams} from '../components/LightBeams';
import {easeInOutCubic, easeOutCubic} from '../helpers/easing';

const WAYS = [
  'Prayer & Surrender',
  'Renew Your Mind',
  'Accountability',
  'Avoid Temptation',
  'Replace with Good Habits',
];

export const Conclusion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const DURATION = 300;

  const fadeIn = interpolate(frame, [0, 25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [265, 298], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = fadeIn * fadeOut;

  // All symbols converge with light growing
  const lightIntensity = interpolate(frame, [0, 150], [0.2, 1], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Camera pulls back dramatically to wide shot
  const camZ = interpolate(frame, [0, DURATION], [8, 14], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const camY = interpolate(frame, [0, DURATION], [1, 3], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Main title reveal
  const titleSpring = spring({frame: frame - 20, fps, config: {damping: 160, stiffness: 60}, from: 0, to: 1});
  const titleOpacity = interpolate(frame, [15, 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);
  const titleScale = interpolate(titleSpring, [0, 1], [0.8, 1]);

  // CTA pulse
  const ctaPulse = 0.9 + 0.1 * Math.sin(frame * 0.1);
  const ctaOpacity = interpolate(frame, [120, 160], [0, 1], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Ways list stagger
  const waysOpacity = WAYS.map((_, i) =>
    interpolate(frame, [60 + i * 20, 90 + i * 20], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const waysY = WAYS.map((_, i) =>
    interpolate(
      spring({frame: frame - 55 - i * 20, fps, config: {damping: 180, stiffness: 70}, from: 0, to: 1}),
      [0, 1], [20, 0]
    )
  );

  return (
    <AbsoluteFill style={{opacity}}>
      {/* Grand finale background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, #${Math.floor(lightIntensity * 26).toString(16).padStart(2,'0')}1040 0%, #030308 70%)`,
        }}
      />

      {/* 3D Scene */}
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height}>
          <CameraController position={[0, camY, camZ]} target={[0, 0.5, 0]} fov={50} />
          <ambientLight color="#C8A84B" intensity={lightIntensity * 0.6} />
          <directionalLight position={[0, 12, 3]} color="#FFD700" intensity={lightIntensity * 3} />
          <pointLight position={[0, 8, 0]} color="#FFF8E7" intensity={lightIntensity * 5} distance={25} />

          {/* Central cross */}
          <group position={[0, -0.3, -2]}>
            <Cross glowIntensity={lightIntensity} scale={1.5} />
          </group>

          {/* Doves flying out */}
          {[[-3, 3, 0.5], [3, 3.5, 0.3], [-1.5, 4, 1], [2, 2.8, 0.8]].map(([dx, dy, dz], i) => {
            const appear = interpolate(frame, [60 + i * 30, 90 + i * 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const doveX = interpolate(frame, [60 + i * 30, 300], [0, dx * 2], {
              easing: easeOutCubic,
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const doveY2 = interpolate(frame, [60 + i * 30, 300], [1, dy + 1], {
              easing: easeOutCubic,
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <group key={i} position={[doveX, doveY2, dz]} scale={[appear, appear, appear]}>
                <Dove flapSpeed={1.2 + i * 0.3} color="#FFFFFF" />
              </group>
            );
          })}

          {/* Grand particle celebration */}
          <ParticleField count={300} spread={25} color="#FFD700" size={0.04} speed={0.5} drift="up" />
          <ParticleField count={150} spread={20} color="#FFFFFF" size={0.02} speed={0.3} drift="up" />
          <ParticleField count={80} spread={15} color="#C8A84B" size={0.03} speed={0.7} drift="up" />
        </ThreeCanvas>
      </AbsoluteFill>

      <LightBeams color="#FFD700" numBeams={14} opacity={0.18 * lightIntensity} startFrame={0} />

      {/* Text overlay */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '0 80px'}}>
        {/* Main message */}
        <div
          style={{
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: 72,
            fontWeight: 900,
            color: '#FFD700',
            textAlign: 'center',
            opacity: titleOpacity * fadeOut,
            transform: `translateY(${titleY}px) scale(${titleScale})`,
            textShadow: '0 0 60px #FFD70088, 0 4px 8px rgba(0,0,0,0.9)',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          You Can Be Free
        </div>

        {/* Ways recap */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40}}>
          {WAYS.map((way, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: waysOpacity[i],
                transform: `translateY(${waysY[i]}px)`,
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#FFD700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Cinzel, Georgia, serif',
                fontSize: 14,
                fontWeight: 700,
                color: '#030308',
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div style={{
                fontFamily: 'Georgia, serif',
                fontSize: 20,
                color: '#E8DCC8',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                letterSpacing: 1,
              }}>
                {way}
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div
          style={{
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: 22,
            color: '#C8A84B',
            textAlign: 'center',
            opacity: ctaOpacity * ctaPulse,
            letterSpacing: 3,
            textTransform: 'uppercase',
            textShadow: '0 0 20px #C8A84B44',
            border: '1px solid #C8A84B44',
            padding: '14px 40px',
            borderRadius: 2,
          }}
        >
          Start Your Journey Today
        </div>
      </AbsoluteFill>

      <LensFlare x={0.5} y={0.1} intensity={lightIntensity * 0.9} color="#FFD700" startFrame={30} endFrame={260} />
      <LensFlare x={0.2} y={0.2} intensity={0.3} color="#C8A84B" startFrame={80} endFrame={260} />
      <FilmGrain opacity={0.08} />
    </AbsoluteFill>
  );
};
