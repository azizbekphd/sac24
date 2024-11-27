import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const extensionLoaderMap = {
  glb: GLTFLoader,
  obj: OBJLoader,
};

type ModelProps = {
  source: string;
  position: THREE.Vector3;
  scale?: number;
  color?: string | null;
};

const Model = ({ source, position, scale, color }: ModelProps) => {
  const extension = source.split('.').pop()?.toLowerCase() as keyof typeof extensionLoaderMap;
  const Loader = extensionLoaderMap[extension];

  if (!Loader) {
    throw new Error(`Unsupported file extension: ${extension}`);
  }

  const model = useLoader(Loader, source);

  useLayoutEffect(() => {
    if (!model || !color) return;

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(color);
      }
    });
  }, [color, model]);

  return <primitive object={model} scale={scale} position={position} />;
};

export default Model;
