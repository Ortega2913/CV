import React from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
  position: [number, number, number];
  target?: [number, number, number];
  fov?: number;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  position,
  target = [0, 0, 0],
  fov = 45,
}) => {
  const {camera, size} = useThree();

  const perspCamera = camera as THREE.PerspectiveCamera;
  perspCamera.position.set(...position);
  perspCamera.lookAt(new THREE.Vector3(...target));
  perspCamera.fov = fov;
  perspCamera.aspect = size.width / size.height;
  perspCamera.updateProjectionMatrix();

  return null;
};
