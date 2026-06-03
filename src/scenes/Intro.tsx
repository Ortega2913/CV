import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Cross} from '../three/Cross';
import {ParticleField} from '../three/ParticleField';
import {CameraController} from '../three/CameraController';
import {FilmGrain} from '../components/FilmGrain';
import {LensFlare} from '../components/LensFlare';
import {LightBeams} from '../components/LightBeams';
import {easeInOutCubic, easeOutCubic} from '../helpers/easing';

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const totalFrames = 360;

  // Title animation
  const titleIn = spring({frame: frame - 30, fps, config: {damping: 180, stiffness: 60}, from: 0, to: 1});
  const subtitleIn = spring({frame: frame - 80, fps, config: {damping: 200, stiffness: 55}, from: 0, to: 1});
  const taglineIn = spring({frame: frame - 130, fps, config: {damping: 200, stiffness: 50}, from: 0, to: 1});

  const titleOpacity = interpolate(frame, [20, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const subtitleOpacity = interpolate(frame, [70, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const taglineOpacity = interpolate(frame, [120, 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // Fade out at end
  const fadeOut = interpolate(frame, [310, 355], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // Camera slowly pushes in
  const camZ = interpolate(frame, [0, totalFrames], [14, 9], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const camY = interpolate(frame, [0, totalFrames], [0.5, 0], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Background flash
  const flashOpacity = interpolate(frame, [0, 8, 15], [1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(titleIn, [0, 1], [60, 0]);
  const titleScale = interpolate(titleIn, [0, 1], [0.75, 1]);
  const subtitleY = interpolate(subtitleIn, [0, 1], [30, 0]);
  const taglineY = interpolate(taglineIn, [0, 1], [20, 0]);

  // Line reveal progress
  const lineWidth = interpolate(frame, [50, 130], [0, 100], {
    easing: easeOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #1A0A2E 0%, #030308 70%)', opacity: fadeOut}}>
      {/* 3D Scene */}
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height}>
          <CameraController position={[0, camY, camZ]} target={[0, 0.5, 0]} fov={42} />
          <ambientLight color="#1A1040" intensity={0.5} />
          <directionalLight position={[0, 8, 2]} color="#FFD700" intensity={1.5} />
          <pointLight position={[0, 10, 3]} color="#FFF8E7" intensity={3} distance={20} />
          <spotLight
            position={[0, 12, 0]}
            target-position={[0, 0, 0]}
            color="#C8A84B"
            intensity={8}
            angle={0.3}
            penumbra={0.7}
            distance={30}
            castShadow
          />
          {/* Central cross */}
          <group position={[0, -0.5, 0]}>
            <Cross glowIntensity={0.8} scale={1.3} />
          </group>
          {/* Background particles */}
          <ParticleField count={300} spread={30} color="#C8A84B" size={0.03} speed={0.2} drift="up" />
          <ParticleField count={100} spread={20} color="#FFFFFF" size={0.015} speed={0.1} drift="up" />
          {/* Atmospheric fog layers */}
          <mesh position={[0, -3, -8]} rotation={[-0.2, 0, 0]}>
            <planeGeometry args={[40, 20]} />
            <meshBasicMaterial color="#0A0820" transparent opacity={0.4} depthWrite={false} />
          </mesh>
        </ThreeCanvas>
      </AbsoluteFill>

      {/* Light beams */}
      <LightBeams color="#C8A84B" numBeams={10} opacity={0.15} startFrame={20} />

      {/* White flash at start */}
      <AbsoluteFill style={{background: 'white', opacity: flashOpacity, pointerEvents: 'none'}} />

      {/* Title text */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 0}}>
        {/* Decorative top line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 24,
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
        }}>
          <div style={{width: `${lineWidth * 1.5}px`, height: 1, background: 'linear-gradient(to right, transparent, #C8A84B)'}} />
          <div style={{fontFamily: 'Cinzel, Georgia, serif', fontSize: 14, letterSpacing: 8, color: '#C8A84B', textTransform: 'uppercase'}}>
            A Spiritual Journey
          </div>
          <div style={{width: `${lineWidth * 1.5}px`, height: 1, background: 'linear-gradient(to left, transparent, #C8A84B)'}} />
        </div>

        {/* Main title */}
        <div
          style={{
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: 96,
            fontWeight: 900,
            color: '#FFD700',
            textAlign: 'center',
            lineHeight: 1,
            opacity: titleOpacity * fadeOut,
            transform: `translateY(${titleY}px) scale(${titleScale})`,
            textShadow: '0 0 60px #FFD70088, 0 0 120px #C8A84B44, 0 4px 8px rgba(0,0,0,0.9)',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          5 Ways to
        </div>
        <div
          style={{
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: 96,
            fontWeight: 900,
            color: '#FFF8E7',
            textAlign: 'center',
            lineHeight: 1.1,
            opacity: titleOpacity * fadeOut,
            transform: `translateY(${titleY * 0.8}px) scale(${titleScale})`,
            textShadow: '0 0 40px #FFD70055, 0 4px 8px rgba(0,0,0,0.9)',
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          Quit Sinning
        </div>

        {/* Accent line */}
        <div style={{
          width: `${lineWidth * 2}px`,
          height: 2,
          background: 'linear-gradient(to right, transparent, #FFD700, transparent)',
          marginBottom: 24,
          opacity: subtitleOpacity,
        }} />

        {/* Tagline */}
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: 24,
            color: '#C8A84B',
            textAlign: 'center',
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            letterSpacing: 2,
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          Practical steps toward freedom and spiritual renewal
        </div>
      </AbsoluteFill>

      {/* Lens flares */}
      <LensFlare x={0.5} y={0.08} intensity={0.8} color="#FFD700" startFrame={60} endFrame={120} />
      <LensFlare x={0.3} y={0.15} intensity={0.4} color="#C8A84B" startFrame={90} endFrame={180} />

      <FilmGrain opacity={0.1} />
    </AbsoluteFill>
  );
};
