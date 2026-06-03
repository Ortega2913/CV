import React from "react";
import * as THREE from "three";

type CharacterProps = {
  position: [number, number, number];
  color: string;
  label: string;
  scale?: number;
};

/** Stylised stick-figure character built from Three.js primitives. */
export const Character: React.FC<CharacterProps> = ({
  position,
  color,
  label: _label,
  scale = 1,
}) => {
  const mat = new THREE.MeshStandardMaterial({ color });
  const [x, y, z] = position;

  const head = new THREE.SphereGeometry(0.18 * scale, 16, 16);
  const torso = new THREE.CylinderGeometry(
    0.08 * scale,
    0.1 * scale,
    0.55 * scale,
    12
  );
  const limb = new THREE.CylinderGeometry(
    0.045 * scale,
    0.045 * scale,
    0.42 * scale,
    8
  );

  return (
    <group position={[x, y, z]}>
      {/* Head */}
      <mesh geometry={head} material={mat} position={[0, 0.62 * scale, 0]} />

      {/* Torso */}
      <mesh geometry={torso} material={mat} position={[0, 0.27 * scale, 0]} />

      {/* Left arm */}
      <mesh
        geometry={limb}
        material={mat}
        position={[-0.28 * scale, 0.27 * scale, 0]}
        rotation={[0, 0, Math.PI / 4]}
      />

      {/* Right arm */}
      <mesh
        geometry={limb}
        material={mat}
        position={[0.28 * scale, 0.27 * scale, 0]}
        rotation={[0, 0, -Math.PI / 4]}
      />

      {/* Left leg */}
      <mesh
        geometry={limb}
        material={mat}
        position={[-0.14 * scale, -0.21 * scale, 0]}
        rotation={[0, 0, Math.PI / 12]}
      />

      {/* Right leg */}
      <mesh
        geometry={limb}
        material={mat}
        position={[0.14 * scale, -0.21 * scale, 0]}
        rotation={[0, 0, -Math.PI / 12]}
      />
    </group>
  );
};
