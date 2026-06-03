import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {HumanFigure} from '../three/HumanFigure';
import {ParticleField} from '../three/ParticleField';
import {CameraController} from '../three/CameraController';
import {SceneTitle} from '../components/SceneTitle';
import {FilmGrain} from '../components/FilmGrain';
import {LensFlare} from '../components/LensFlare';
import {LightBeams} from '../components/LightBeams';
import {easeInOutCubic, easeOutCubic} from '../helpers/easing';

// Procedural shadow hand
const ShadowHand: React.FC<{side: 'left' | 'right'; reachProgress: number; retreatProgress: number}> = ({
  side,
  reachProgress,
  retreatProgress,
}) => {
  const xDir = side === 'left' ? -1 : 1;
  const xBase = side === 'left' ? -5 : 5;
  const reachX = interpolate(reachProgress, [0, 1], [xBase, xBase + xDir * 3]);
  const finalX = interpolate(retreatProgress, [0, 1], [reachX, xBase - xDir * 2]);
  const fingerSpread = Math.sin(reachProgress * Math.PI) * 0.3;

  const mat = <meshBasicMaterial color="#2D0030" transparent opacity={0.8 * (1 - retreatProgress)} />;

  return (
    <group position={[finalX, 0.5, 1]}>
      {/* Palm */}
      <mesh>
        <boxGeometry args={[0.6, 0.8, 0.15]} />
        {mat}
      </mesh>
      {/* Fingers */}
      {[-0.2, -0.07, 0.07, 0.2].map((fx, i) => (
        <mesh key={i} position={[fx * xDir, 0.65, 0]} rotation={[0, 0, (fx * xDir) * fingerSpread]}>
          <capsuleGeometry args={[0.07, 0.35, 4, 8]} />
          {mat}
        </mesh>
      ))}
      {/* Thumb */}
      <mesh position={[xDir * 0.38, 0.1, 0]} rotation={[0, 0, -xDir * 0.8]}>
        <capsuleGeometry args={[0.065, 0.25, 4, 8]} />
        {mat}
      </mesh>
    </group>
  );
};

export const Scene4AvoidTemptation: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const DURATION = 540;

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [510, 540], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = fadeIn * fadeOut;

  // Hands reach in 0-120
  const reachProgress = interpolate(frame, [0, 100], [0, 1], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Hands retreat 250-380
  const retreatProgress = interpolate(frame, [250, 380], [0, 1], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Figure walks away from left to right 180-400
  const figureX = interpolate(frame, [150, 400], [-0.5, 4.5], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Dark area fades out on left
  const darkOpacity = interpolate(frame, [200, 420], [1, 0.2], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Light grows on right
  const lightOpacity = interpolate(frame, [200, 420], [0, 1], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const walkCycle = (frame % 50) / 50;
  const isWalking = frame > 150 && frame < 420;

  // Camera tracks figure walking
  const camX = interpolate(frame, [150, 420], [-1, 2.5], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const camZ = interpolate(frame, [0, DURATION], [10, 8], {
    easing: easeInOutCubic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity}}>
      {/* Split background: dark left, light right */}
      <AbsoluteFill>
        <div style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(to right,
            rgba(45,5,5,${darkOpacity}) 0%,
            rgba(3,3,10,0.95) 40%,
            rgba(10,20,45,0.9) 60%,
            rgba(20,40,80,${lightOpacity}) 100%)`,
        }} />
      </AbsoluteFill>

      {/* 3D Scene */}
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height}>
          <CameraController position={[camX, 1.5, camZ]} target={[figureX * 0.7, 0.8, 0]} fov={44} />
          <ambientLight color="#050208" intensity={0.3} />
          {/* Dark red light on left (temptation) */}
          <pointLight position={[-6, 2, 2]} color="#8B0000" intensity={darkOpacity * 2} distance={10} />
          {/* Hope light on right */}
          <pointLight position={[8, 5, 3]} color="#2D81FF" intensity={lightOpacity * 3} distance={15} />
          <directionalLight position={[5, 8, 2]} color="#90CAF9" intensity={lightOpacity * 1.5} />

          {/* Shadow hands */}
          <ShadowHand side="left" reachProgress={reachProgress} retreatProgress={retreatProgress} />
          <ShadowHand side="right" reachProgress={reachProgress} retreatProgress={retreatProgress} />

          {/* Walking figure */}
          <group position={[figureX, -0.5, 0.5]}>
            <HumanFigure
              pose={isWalking ? 'walking' : 'standing'}
              color="#0D1030"
              emissive="#2D81FF"
              emissiveIntensity={lightOpacity * 0.4}
              walkCycle={walkCycle}
            />
            {/* Aura around figure */}
            {lightOpacity > 0.1 && (
              <mesh position={[0, 1, -0.1]}>
                <sphereGeometry args={[1.2, 16, 16]} />
                <meshBasicMaterial color="#2D81FF" transparent opacity={lightOpacity * 0.06} depthWrite={false} side={2} />
              </mesh>
            )}
          </group>

          {/* Dark shadow fog on left */}
          {[[-4, 0, -3], [-5, 1, -2], [-3, -0.5, -4]].map(([x, y, z], i) => {
            const wobble = Math.sin(frame * 0.03 + i * 1.5) * 0.5;
            return (
              <mesh key={i} position={[x + wobble, y, z]} rotation={[0, Math.sin(frame * 0.02 + i) * 0.3, 0]}>
                <sphereGeometry args={[1.5 + i * 0.3, 8, 8]} />
                <meshBasicMaterial color="#1A001A" transparent opacity={darkOpacity * 0.4} depthWrite={false} />
              </mesh>
            );
          })}

          {/* Light particles on right */}
          {lightOpacity > 0 && (
            <group position={[5, 0, 0]}>
              <ParticleField count={100} spread={8} color="#90CAF9" size={0.03} speed={0.4} drift="up" />
            </group>
          )}
          <ParticleField count={50} spread={15} color="#2D81FF" size={0.02} speed={0.1} drift="none" />

          {/* Ground */}
          <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[30, 20]} />
            <meshStandardMaterial color="#060608" roughness={0.95} />
          </mesh>
        </ThreeCanvas>
      </AbsoluteFill>

      <LightBeams color="#2D81FF" numBeams={5} opacity={0.08 * lightOpacity} startFrame={200} />

      {/* Dark vignette on left */}
      <AbsoluteFill style={{
        background: `linear-gradient(to right, rgba(45,0,10,${darkOpacity * 0.6}), transparent 50%)`,
        pointerEvents: 'none',
      }} />

      <SceneTitle
        number="Way 4"
        title="Avoid Temptation"
        verse="Flee youthful passions and pursue righteousness, faith, love, and peace."
        verseRef="2 Timothy 2:22"
        startFrame={30}
        titleColor="#90CAF9"
        accentColor="#2D81FF"
      />

      <LensFlare x={0.85} y={0.15} intensity={lightOpacity * 0.7} color="#2D81FF" startFrame={200} endFrame={480} />
      <FilmGrain opacity={0.12} />
    </AbsoluteFill>
  );
};
