import * as THREE from "three";
import { dispose, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { SUN_MODEL_HEIGHT } from "../../globals/constants";
import config from "../../globals/config.json";


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

const UnwrappedModel = ({ source, position, scale = 1, color }: ModelProps) => {
    const modelRef = useRef<THREE.Group>(null!);

    const extension = useMemo(() => {
        return source.split(".").pop()?.toLowerCase() as keyof typeof extensionLoaderMap
    }, [source]);

    const Loader = useMemo(() => {
        const _Loader = extensionLoaderMap[extension];

        if (!_Loader) {
            throw new Error(`Unsupported file extension: ${extension}`);
        }

        return _Loader;
    }, [extension]);

    const loader = useLoader<any, any, any>(Loader, source);

    const model = useMemo(() => {
        if (loader.scene) {
            return loader.scene;
        }
        return loader;
    }, [loader]);

    useEffect(() => {
        return () => {
            dispose(model)
            useLoader.clear(Loader, source)
        }
    }, [model, Loader, source])

    const modelSizeCompensationFactor = useMemo(() => {
        if (!model) return;
        const box = new THREE.Box3().setFromObject(model.scene ?? model);
        const size = new THREE.Vector3();
        box.getSize(size);
        return SUN_MODEL_HEIGHT / size.y;
    }, [model]);

    const finalScale = useMemo(() => {
        const _scale = scale * config.camera.scale;
        return _scale * modelSizeCompensationFactor!;
    }, [scale, modelSizeCompensationFactor]);

    useEffect(() => {
        if (modelRef.current) {
            modelRef.current.position.copy(position);
        }
    }, [position]);

    useEffect(() => {
        if (modelRef.current) {
            modelRef.current.scale.set(finalScale, finalScale, finalScale);
        }
    }, [finalScale]);

    useLayoutEffect(() => {
        if (!model || !color || !model.traverse) return;

        model.traverse((child: THREE.Mesh) => {
            if (child.isMesh) {
                (child.material as THREE.MeshStandardMaterial).color.set(color);
            }
        });
    }, [color, model]);

    return <primitive ref={modelRef} object={model} />;
};

const Model = (props: ModelProps) => {
    return (
        <Suspense fallback={null}>
            <UnwrappedModel {...props} />
        </Suspense>
    );
};

export default Model;
