import React, {useMemo} from 'react';
import {easeOutCubic} from '../helpers/easing';

interface BrokenChainsProps {
  breakProgress?: number;
}

export const BrokenChains: React.FC<BrokenChainsProps> = ({breakProgress = 0}) => {
  const eased = easeOutCubic(Math.min(breakProgress, 1));

  const links = useMemo(() => {
    const l = [];
    for (let i = 0; i < 10; i++) {
      l.push({
        y: (i - 4.5) * 0.55,
        rotX: (i % 2 === 0 ? Math.PI / 2 : 0),
        isBreak: i === 4 || i === 5,
      });
    }
    return l;
  }, []);

  const chainMaterial = (
    <meshStandardMaterial
      color="#8B7355"
      metalness={0.85}
      roughness={0.15}
      envMapIntensity={1}
    />
  );

  const brokenMaterial = (
    <meshStandardMaterial
      color="#B8860B"
      metalness={0.9}
      roughness={0.1}
      emissive="#FF6600"
      emissiveIntensity={eased * 0.5}
    />
  );

  return (
    <group>
      {links.map((link, i) => {
        let px = 0;
        let py = link.y;
        let rz = 0;

        if (link.isBreak && eased > 0) {
          const side = i === 4 ? -1 : 1;
          px = side * eased * 2.5;
          py = link.y + eased * (i === 4 ? -1.5 : 1.5);
          rz = side * eased * Math.PI * 0.6;
        }

        return (
          <mesh key={i} position={[px, py, 0]} rotation={[link.rotX, 0, rz]}>
            <torusGeometry args={[0.22, 0.055, 12, 24]} />
            {link.isBreak ? brokenMaterial : chainMaterial}
          </mesh>
        );
      })}
      {/* Glow effect at break point */}
      {eased > 0.1 && (
        <pointLight
          position={[0, 0, 0.5]}
          color="#FF8C00"
          intensity={eased * 3}
          distance={4}
        />
      )}
    </group>
  );
};
