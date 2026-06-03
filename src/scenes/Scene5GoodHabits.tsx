import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Tree} from '../three/Tree';
import {Dove} from '../three/Dove';
import {ParticleField} from '../three/ParticleField';
import {CameraController} from '../three/CameraController';
import {SceneTitle} from '../components/SceneTitle';
import {FilmGrain} from '../components/FilmGrain';
import {LensFlare} from '../components/LensFlare';
import {LightBeams} from '../components/LightBeams';
import {easeInOutCubic, easeOutCubic} from '../helpers/easing';

export const Scene5GoodHabits: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const DURATION = 480;

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [450, 480], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = fadeIn * fadeOut;

  // Tree grows from 0 to full over 300 frames
  const growProgress = interpolate(frame, [0, 300], [0, 1], {
    easing: easeOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Dove appears at frame 200, flies across
  const doveOpacity = interpolate(frame, [200, 240], [0, 1], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const doveX = interpolate(frame, [200, 480], [-8, 8], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const doveY = interpolate(frame, [200, 480], [2, 3.5], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Light brightens as tree grows
  const lightIntensity = interpolate(frame, [0, 300], [0.3, 1], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Camera slowly rises to appreciate the full tree
  const camY = interpolate(frame, [0, DURATION], [1, 2.5], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const camZ = interpolate(frame, [0, DURATION], [10, 8], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const camX = Math.sin(frame * 0.004) * 1.5;

  // Background gets brighter
  const bgBrightness = interpolate(frame, [0, 300], [0, 0.3], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity}}>
      {/* Deep green background evolving to bright */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 60%, #0${Math.floor(bgBrightness * 15).toString(16)}2${Math.floor(bgBrightness * 15).toString(16)}0${Math.floor(bgBrightness * 15).toString(16)} 0%, #040804 70%)`,
        }}
      />

      {/* 3D Scene */}
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height}>
          <CameraController position={[camX, camY, camZ]} target={[0, 1.5, 0]} fov={42} />
          <ambientLight color="#0A1A0A" intensity={0.4 + lightIntensity * 0.4} />
          {/* Sunlight from above */}
          <directionalLight
            position={[3, 12, 5]}
            color="#FFF8C0"
            intensity={lightIntensity * 2.5}
            castShadow
          />
          <pointLight position={[0, 5, 3]} color="#4CAF50" intensity={lightIntensity * 1.5} distance={15} />
          <pointLight position={[-3, 3, 3]} color="#C8A84B" intensity={lightIntensity} distance={10} />
          {/* Warm fill from below */}
          <pointLight position={[0, -0.5, 2]} color="#8BC34A" intensity={lightIntensity * 0.5} distance={8} />

          {/* Main tree */}
          <group position={[0, -0.5, 0]}>
            <Tree growProgress={growProgress} color="#2D5A27" fruitColor="#E74C3C" />
          </group>

          {/* Two smaller background trees */}
          {growProgress > 0.6 && (
            <>
              <group position={[-4, -0.5, -3]} scale={[0.6, 0.6, 0.6]}>
                <Tree growProgress={Math.max(0, growProgress - 0.3)} color="#1E3D1A" fruitColor="#F39C12" />
              </group>
              <group position={[4, -0.5, -3]} scale={[0.55, 0.55, 0.55]}>
                <Tree growProgress={Math.max(0, growProgress - 0.4)} color="#2D5A27" fruitColor="#E74C3C" />
              </group>
            </>
          )}

          {/* Seed glow at start */}
          {growProgress < 0.1 && (
            <mesh position={[0, -0.48, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#C8A84B" transparent opacity={(0.1 - growProgress) * 10} />
            </mesh>
          )}

          {/* Flying dove */}
          <group
            position={[doveX, doveY, 1]}
            rotation={[0.1, doveX > 0 ? 0.2 : -0.2, 0]}
            scale={[doveOpacity, doveOpacity, doveOpacity]}
          >
            <Dove flapSpeed={1.5} color="#FFFFFF" />
            <pointLight position={[0, 0.3, 0]} color="#FFFFFF" intensity={doveOpacity * 0.8} distance={3} />
          </group>

          {/* Golden pollen/seed particles */}
          <ParticleField count={120} spread={14} color="#C8A84B" size={0.025} speed={0.3 * growProgress} drift="up" />
          <ParticleField count={60} spread={8} color="#4CAF50" size={0.02} speed={0.2 * growProgress} drift="up" />
          {growProgress > 0.8 && (
            <ParticleField count={40} spread={6} color="#FFFFFF" size={0.015} speed={0.5} drift="up" />
          )}

          {/* Green meadow ground */}
          <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[30, 20]} />
            <meshStandardMaterial
              color="#0A1A07"
              roughness={0.95}
              emissive="#1A3A10"
              emissiveIntensity={lightIntensity * 0.15}
            />
          </mesh>
        </ThreeCanvas>
      </AbsoluteFill>

      <LightBeams color="#C8A84B" numBeams={8} opacity={0.1 * lightIntensity} startFrame={0} />

      {/* Golden shimmer overlay */}
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at 50% 40%, rgba(200,168,75,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
        opacity: lightIntensity,
      }} />

      <SceneTitle
        number="Way 5"
        title="Replace with Good Habits"
        verse="Whatever is true, whatever is honorable... think about such things."
        verseRef="Philippians 4:8"
        startFrame={30}
        titleColor="#8BC34A"
        accentColor="#4CAF50"
      />

      <LensFlare x={0.75} y={0.1} intensity={lightIntensity * 0.6} color="#C8A84B" startFrame={100} endFrame={420} />
      <FilmGrain opacity={0.08} />
    </AbsoluteFill>
  );
};
