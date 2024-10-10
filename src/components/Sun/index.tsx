import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { FakeGlowMaterial } from '../FakeGlowMaterial';


function ConstantSizeSphere() {
  const ref = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();

  useFrame(() => {
    if (ref.current) {
      const distance = ref.current.position.distanceTo(camera.position);
      const scaleFactor = distance * 0.5;
      [ref].forEach(r => {
          r.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
      });
    }
  });

  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[0.01, 10, 10]} />
        <meshBasicMaterial color={"#FDB813"} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <FakeGlowMaterial
          glowColor={"#fae102"}
          glowSharpness={0}
          falloff={0}
          glowInternalRadius={5}
        />
      </mesh>
    </>
  );
}

export default ConstantSizeSphere;
