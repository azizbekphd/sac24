import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import React from 'react';


type ConstantSizeSphereProps = {
    ref: React.MutableRefObject<THREE.Mesh>;
    size: number;
    color: string;
}


function ConstantSizeSphere({ ref, size, color }: ConstantSizeSphereProps) {
  const { camera } = useThree();

  useFrame(() => {
    if (ref.current) {
      const distance = ref.current.position.distanceTo(camera.position);
      const scaleFactor = distance * 0.01;
      ref.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

export default ConstantSizeSphere;
