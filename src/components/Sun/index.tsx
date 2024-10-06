import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';


function ConstantSizeSphere() {
  const ref = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();

  useFrame(() => {
    if (ref.current) {
      const distance = ref.current.position.distanceTo(camera.position);
      const scaleFactor = distance * 0.5;
      ref.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.01, 32, 32]} />
      <meshBasicMaterial color={"#FDB813"} />
    </mesh>
  );
}

export default ConstantSizeSphere;
