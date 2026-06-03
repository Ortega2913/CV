import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Cross} from '../three/Cross';
import {BrokenChains} from '../three/BrokenChains';
import {HumanFigure} from '../three/HumanFigure';
import {ParticleField} from '../three/ParticleField';
import {CameraController} from '../three/CameraController';
import {SceneTitle} from '../components/SceneTitle';
import {FilmGrain} from '../components/FilmGrain';
import {LensFlare} from '../components/LensFlare';
import {LightBeams} from '../components/LightBeams';
import {easeInOutCubic, progress} from '../helpers/easing';

export const Scene1Prayer: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const DURATION = 540;

  // Fade in/out
  const fadeIn = interpolate(frame, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [510, 540], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = fadeIn * fadeOut;

  // Chain break happens at frame 200
  const breakProgress = interpolate(frame, [180, 300], [0, 1], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Light intensity grows after chains break
  const lightIntensity = interpolate(frame, [200, 350], [0.3, 1], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Camera: slow dolly in, slight upward tilt at break
  const camZ = interpolate(frame, [0, DURATION], [11, 7.5], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const camY = interpolate(frame, [150, 300], [1, 2.5], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const targetY = interpolate(frame, [150, 300], [0.5, 1.5], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Parallax background drift
  const bgX = interpolate(frame, [0, DURATION], [-10, 10], {easing: easeInOutCubic, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bgY = interpolate(frame, [0, DURATION], [0, -8], {easing: easeInOutCubic, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{opacity}}>
      {/* Deep parallax background */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #1A1040 0%, #030308 80%)',
          transform: `translate(${bgX * 0.3}px, ${bgY * 0.3}px) scale(1.1)`,
        }}
      />

      {/* 3D Scene */}
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height}>
          <CameraController position={[0, camY, camZ]} target={[0, targetY, 0]} fov={44} />
          <ambientLight color="#0A0820" intensity={0.4} />
          {/* Divine spotlight from above */}
          <spotLight
            position={[0, 14, 2]}
            target-position={[0, 0, 0]}
            color="#FFF8E7"
            intensity={lightIntensity * 12}
            angle={0.25}
            penumbra={0.8}
            distance={25}
            castShadow
          />
          <pointLight position={[0, 6, 3]} color="#C8A84B" intensity={lightIntensity * 2} distance={12} />
          <pointLight position={[-3, 3, -2]} color="#1A1040" intensity={0.5} distance={8} />

          {/* Kneeling figure */}
          <group position={[0, -0.5, 0]}>
            <HumanFigure
              pose="kneeling"
              color="#0D0D1A"
              emissive="#2D1B69"
              emissiveIntensity={0.2}
            />
          </group>

          {/* Chains around figure */}
          <group position={[-0.6, 0.3, 0.3]} rotation={[0.2, 0.5, 0]} scale={[0.5, 0.5, 0.5]}>
            <BrokenChains breakProgress={breakProgress} />
          </group>
          <group position={[0.6, 0.2, 0.4]} rotation={[0.1, -0.3, 0.2]} scale={[0.45, 0.45, 0.45]}>
            <BrokenChains breakProgress={breakProgress} />
          </group>

          {/* Cross in background */}
          <group position={[0, 2, -4]} scale={[0.8, 0.8, 0.8]}>
            <Cross glowIntensity={lightIntensity * 0.6} scale={1} />
          </group>

          {/* Rising light particles after break */}
          {breakProgress > 0.2 && (
            <ParticleField
              count={Math.floor(150 * breakProgress)}
              spread={8}
              color="#FFD700"
              size={0.04}
              speed={0.6}
              drift="up"
            />
          )}
          <ParticleField count={80} spread={20} color="#C8A84B" size={0.02} speed={0.15} drift="up" />

          {/* Ground plane */}
          <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#050510" roughness={0.95} metalness={0.1} />
          </mesh>
        </ThreeCanvas>
      </AbsoluteFill>

      {/* Light beams from above */}
      <LightBeams
        color="#FFF8E7"
        numBeams={6}
        opacity={0.12 * lightIntensity}
        startFrame={150}
      />

      {/* Foreground particles (fast parallax layer) */}
      <AbsoluteFill style={{transform: `translate(${bgX * -0.5}px, ${bgY * -0.2}px)`, pointerEvents: 'none'}}>
        <svg style={{width: '100%', height: '100%'}} xmlns="http://www.w3.org/2000/svg">
          {Array.from({length: 12}, (_, i) => {
            const x = (i / 12) * 100 + Math.sin(frame * 0.02 + i) * 2;
            const y = ((frame * 0.3 + i * 30) % 120) - 10;
            const size = 2 + (i % 3) * 2;
            return (
              <circle
                key={i}
                cx={`${x}%`}
                cy={`${y}%`}
                r={size}
                fill="#C8A84B"
                opacity={(0.15 + 0.1 * Math.sin(i * 0.7)) * breakProgress}
              />
            );
          })}
        </svg>
      </AbsoluteFill>

      {/* Scene title */}
      <SceneTitle
        number="Way 1"
        title="Prayer & Surrender"
        verse="Come to me, all who labor and are heavy laden, and I will give you rest."
        verseRef="Matthew 11:28"
        startFrame={30}
        titleColor="#FFD700"
        accentColor="#C8A84B"
      />

      <LensFlare x={0.5} y={0.05} intensity={lightIntensity * 0.7} color="#FFF8E7" startFrame={180} endFrame={400} />
      <FilmGrain opacity={0.1} />
    </AbsoluteFill>
  );
};
