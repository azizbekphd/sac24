import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useContext, useRef } from 'react';
import { FakeGlowMaterial } from '../FakeGlowMaterial';
import { FocusContext } from '../../contexts';
import Model from '../Model';


function ConstantSizeSphere() {
  const ref = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();
  const { selected } = useContext(FocusContext);

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
      <mesh ref={ref} onPointerDown={() => selected.setObjectId(null)}>
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
      <Model
        source="models/sun.glb"
        position={new THREE.Vector3(0, 0, 0)}
        scale={1}
        />
    </>
  );
}

export default ConstantSizeSphere;
