import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Bible} from '../three/Bible';
import {ParticleField} from '../three/ParticleField';
import {CameraController} from '../three/CameraController';
import {SceneTitle} from '../components/SceneTitle';
import {FilmGrain} from '../components/FilmGrain';
import {LensFlare} from '../components/LensFlare';
import {LightBeams} from '../components/LightBeams';
import {easeInOutCubic, easeOutCubic} from '../helpers/easing';

export const Scene2RenewMind: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const DURATION = 540;

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [510, 540], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = fadeIn * fadeOut;

  // Bible opens at frame 80-200
  const openProgress = interpolate(frame, [60, 220], [0, 1], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Dark "thought clouds" dissipate
  const thoughtOpacity = interpolate(frame, [0, 180], [0.8, 0], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lightOpacity = interpolate(frame, [120, 300], [0, 1], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Camera orbit: slight rotation around bible
  const camX = interpolate(frame, [0, DURATION], [-2, 2], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const camZ = interpolate(frame, [0, DURATION], [9, 7], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bgShift = interpolate(frame, [0, DURATION], [0, 15], {easing: easeInOutCubic, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{opacity}}>
      {/* Background - shifts from dark to warm */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${50 - bgShift}% ${50 + bgShift * 0.3}%, #2A1A05 0%, #060606 70%)`,
        }}
      />

      {/* Dark thought clouds (dissipating) */}
      <AbsoluteFill style={{pointerEvents: 'none', opacity: thoughtOpacity}}>
        <svg style={{width: '100%', height: '100%'}} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="cloud-blur">
              <feGaussianBlur stdDeviation="20" />
            </filter>
          </defs>
          {[
            {cx: '30%', cy: '25%', rx: '18%', ry: '10%'},
            {cx: '65%', cy: '20%', rx: '22%', ry: '12%'},
            {cx: '50%', cy: '35%', rx: '15%', ry: '8%'},
            {cx: '20%', cy: '40%', rx: '12%', ry: '7%'},
          ].map((c, i) => (
            <ellipse key={i} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry}
              fill="#2D0A2D" filter="url(#cloud-blur)" opacity={0.7} />
          ))}
        </svg>
      </AbsoluteFill>

      {/* 3D Scene */}
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height}>
          <CameraController position={[camX, 1.5, camZ]} target={[0, 0, 0]} fov={40} />
          <ambientLight color="#1A1005" intensity={0.4} />
          <directionalLight position={[2, 6, 4]} color="#FFF8E7" intensity={1.5} />
          <pointLight position={[0, 4, 2]} color="#FFD700" intensity={openProgress * 5} distance={15} />
          <spotLight
            position={[0, 10, 0]}
            target-position={[0, 0, 0]}
            color="#C8A84B"
            intensity={openProgress * 8}
            angle={0.4}
            penumbra={0.9}
            distance={20}
          />

          {/* Open Bible - centerpiece */}
          <group position={[0, -0.5, 0]}>
            <Bible openProgress={openProgress} glowIntensity={lightOpacity} />
          </group>

          {/* Rising light particles from bible */}
          {openProgress > 0.3 && (
            <group position={[0, 0.5, 0]}>
              <ParticleField
                count={Math.floor(200 * openProgress)}
                spread={5}
                color="#FFF8E7"
                size={0.025}
                speed={0.8}
                drift="up"
              />
            </group>
          )}
          <ParticleField count={60} spread={20} color="#C8A84B" size={0.02} speed={0.1} drift="up" />

          {/* Background dark wisps transforming to light */}
          {Array.from({length: 5}, (_, i) => {
            const x = (i - 2) * 2.5;
            const wobble = Math.sin(frame * 0.02 + i * 1.2) * 0.3;
            const darkOpacity = Math.max(0, (1 - openProgress) * 0.3);
            return (
              <mesh key={i} position={[x + wobble, 2, -5]} rotation={[0, 0, Math.sin(frame * 0.01 + i) * 0.2]}>
                <planeGeometry args={[1.5, 3]} />
                <meshBasicMaterial color="#1A001A" transparent opacity={darkOpacity} depthWrite={false} />
              </mesh>
            );
          })}

          {/* Illuminated ground */}
          <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[25, 25]} />
            <meshStandardMaterial
              color="#0A0805"
              roughness={0.95}
              emissive="#C8A84B"
              emissiveIntensity={openProgress * 0.08}
            />
          </mesh>
        </ThreeCanvas>
      </AbsoluteFill>

      <LightBeams color="#FFF8E7" numBeams={8} opacity={0.1 * lightOpacity} startFrame={80} />

      {/* Golden light particles overlay (foreground parallax) */}
      <AbsoluteFill style={{pointerEvents: 'none', opacity: lightOpacity}}>
        <svg style={{width: '100%', height: '100%'}} xmlns="http://www.w3.org/2000/svg">
          {Array.from({length: 20}, (_, i) => {
            const x = ((i * 17 + frame * 0.5) % 100);
            const y = ((i * 13 + frame * 0.8) % 100);
            const size = 1 + (i % 3);
            return (
              <circle key={i} cx={`${x}%`} cy={`${y}%`} r={size}
                fill="#FFD700" opacity={0.2 + 0.1 * Math.sin(i * 0.5 + frame * 0.05)} />
            );
          })}
        </svg>
      </AbsoluteFill>

      <SceneTitle
        number="Way 2"
        title="Renew Your Mind"
        verse="Be transformed by the renewing of your mind, that you may discern the will of God."
        verseRef="Romans 12:2"
        startFrame={30}
        titleColor="#FFF8E7"
        accentColor="#C8A84B"
      />

      <LensFlare x={0.5} y={0.1} intensity={lightOpacity * 0.6} color="#FFD700" startFrame={150} endFrame={450} />
      <FilmGrain opacity={0.1} />
    </AbsoluteFill>
  );
};
