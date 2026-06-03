import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {easeOutCubic} from '../helpers/easing';

interface TreeProps {
  growProgress?: number;
  color?: string;
  fruitColor?: string;
}

export const Tree: React.FC<TreeProps> = ({
  growProgress = 1,
  color = '#2D5A27',
  fruitColor = '#E74C3C',
}) => {
  const frame = useCurrentFrame();
  const grow = easeOutCubic(Math.min(growProgress, 1));
  const sway = Math.sin(frame * 0.02) * 0.03 * grow;

  const trunkHeight = 2 * grow;
  const canopyScale = grow;

  return (
    <group>
      {/* Trunk */}
      <mesh position={[0, trunkHeight / 2 - 0.5, 0]} rotation={[0, 0, sway]}>
        <cylinderGeometry args={[0.15, 0.22, trunkHeight, 8]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Branches */}
      {grow > 0.5 && (
        <>
          <mesh position={[-0.4, trunkHeight * 0.65 - 0.5, 0]} rotation={[0, 0, 0.6 + sway]}>
            <cylinderGeometry args={[0.06, 0.1, 0.8, 6]} />
            <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
          </mesh>
          <mesh position={[0.4, trunkHeight * 0.65 - 0.5, 0]} rotation={[0, 0, -0.6 + sway]}>
            <cylinderGeometry args={[0.06, 0.1, 0.8, 6]} />
            <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
          </mesh>
        </>
      )}
      {/* Canopy layers */}
      {[
        {y: trunkHeight - 0.2, radius: 0.9, height: 1.0},
        {y: trunkHeight + 0.4, radius: 0.75, height: 0.9},
        {y: trunkHeight + 0.95, radius: 0.55, height: 0.8},
      ].map((layer, i) => (
        <mesh
          key={i}
          position={[0, layer.y - 0.5, 0]}
          scale={[canopyScale, canopyScale, canopyScale]}
          rotation={[0, (i * Math.PI) / 3, sway * (1 + i * 0.3)]}
        >
          <coneGeometry args={[layer.radius, layer.height, 8]} />
          <meshStandardMaterial
            color={color}
            roughness={0.85}
            emissive="#1A3A17"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
      {/* Fruit (appear when fully grown) */}
      {grow > 0.85 && [
        [-0.5, trunkHeight + 0.2, 0.3],
        [0.5, trunkHeight + 0.1, -0.2],
        [0, trunkHeight + 0.6, 0.4],
        [-0.3, trunkHeight + 0.7, -0.3],
        [0.4, trunkHeight + 0.5, 0.2],
      ].map(([x, y, z], i) => {
        const fruitGrow = easeOutCubic(Math.min((grow - 0.85) / 0.15, 1));
        return (
          <mesh key={i} position={[x, y - 0.5, z]} scale={[fruitGrow, fruitGrow, fruitGrow]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color={fruitColor}
              roughness={0.4}
              emissive={fruitColor}
              emissiveIntensity={0.2}
            />
          </mesh>
        );
      })}
      {/* Ground shadow */}
      <mesh position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2 * grow, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3 * grow} depthWrite={false} />
      </mesh>
    </group>
  );
};
