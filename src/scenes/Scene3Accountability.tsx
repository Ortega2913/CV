import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {HumanFigure} from '../three/HumanFigure';
import {ParticleField} from '../three/ParticleField';
import {CameraController} from '../three/CameraController';
import {SceneTitle} from '../components/SceneTitle';
import {FilmGrain} from '../components/FilmGrain';
import {LensFlare} from '../components/LensFlare';
import {easeInOutCubic} from '../helpers/easing';

export const Scene3Accountability: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const DURATION = 540;

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [510, 540], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = fadeIn * fadeOut;

  // Figures walk in from sides
  const figure1X = interpolate(frame, [0, 120], [-6, -1.0], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const figure2X = interpolate(frame, [0, 120], [6, 1.0], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Walk cycle
  const walkCycle = (frame % 60) / 60;
  const walkSpeedDown = interpolate(frame, [100, 140], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const activeCycle = walkCycle * walkSpeedDown;

  // Connection line appears
  const connectionOpacity = interpolate(frame, [130, 180], [0, 1], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Camera does a slow arc
  const camAngle = interpolate(frame, [0, DURATION], [-0.3, 0.3], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const camZ = interpolate(frame, [0, DURATION], [9, 7.5], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const camX = Math.sin(camAngle) * 3;
  const camZComp = Math.cos(camAngle) * camZ;

  const ambientBrightness = interpolate(frame, [100, 250], [0.3, 0.7], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity}}>
      {/* Warm amber background */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, #2A1A0A 0%, #080808 70%)',
        }}
      />

      {/* 3D Scene */}
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height}>
          <CameraController position={[camX, 1.5, camZComp]} target={[0, 0.8, 0]} fov={44} />
          <ambientLight color="#C8881A" intensity={ambientBrightness * 0.4} />
          <directionalLight position={[3, 8, 3]} color="#FFF0CC" intensity={1.5} />
          <pointLight position={[0, 5, 2]} color="#C8881A" intensity={2} distance={15} />
          {/* Warm fill light */}
          <pointLight position={[-3, 3, 3]} color="#FF8C00" intensity={0.8} distance={10} />
          <pointLight position={[3, 3, 3]} color="#FFB347" intensity={0.8} distance={10} />

          {/* Figure 1 (left) */}
          <group position={[figure1X, -0.5, 0]}>
            <HumanFigure pose="walking" color="#1A1005" emissive="#C8881A" emissiveIntensity={0.15} walkCycle={-activeCycle} />
          </group>
          {/* Figure 2 (right) */}
          <group position={[figure2X, -0.5, 0]}>
            <HumanFigure pose="walking" color="#0F0A05" emissive="#FFB347" emissiveIntensity={0.15} walkCycle={activeCycle} />
          </group>

          {/* Connection glow between them */}
          <mesh position={[0, 0.8, 0.2]} rotation={[0, 0, 0]}>
            <capsuleGeometry args={[0.02, Math.abs(figure2X - figure1X), 4, 8]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={connectionOpacity * 0.5} />
          </mesh>
          <pointLight position={[0, 0.8, 0.5]} color="#C8881A" intensity={connectionOpacity * 1.5} distance={5} />

          {/* Warm atmospheric particles */}
          <ParticleField count={100} spread={18} color="#C8881A" size={0.025} speed={0.2} drift="up" />
          <ParticleField count={40} spread={8} color="#FFD700" size={0.015} speed={0.3} drift="up" />

          {/* Path they walk on */}
          <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[25, 6]} />
            <meshStandardMaterial color="#0A0705" roughness={0.98} emissive="#C8881A" emissiveIntensity={0.04} />
          </mesh>
          {/* Path glow */}
          <mesh position={[0, -0.49, 1]}>
            <boxGeometry args={[25, 0.01, 0.8]} />
            <meshBasicMaterial color="#C8881A" transparent opacity={0.15 * connectionOpacity} />
          </mesh>
        </ThreeCanvas>
      </AbsoluteFill>

      {/* Warm foreground glow */}
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at 50% 100%, #C8881A22 0%, transparent 60%)',
        pointerEvents: 'none',
        opacity: connectionOpacity,
      }} />

      <SceneTitle
        number="Way 3"
        title="Accountability"
        verse="Two are better than one, because they have a good reward for their toil."
        verseRef="Ecclesiastes 4:9"
        startFrame={30}
        titleColor="#FFB347"
        accentColor="#C8881A"
      />

      <LensFlare x={0.5} y={0.12} intensity={0.4} color="#FFB347" startFrame={200} endFrame={450} />
      <FilmGrain opacity={0.1} />
    </AbsoluteFill>
  );
};
