import { useEffect } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";


const useSkybox = () => {
    const skyboxTextures = [
        "right",
        "left",
        "top",
        "bottom",
        "front",
        "back",
    ].map((t) => `/skybox/${t}.png`);
    const [cubeMapTexture] = useLoader(THREE.CubeTextureLoader, [skyboxTextures]);
    const { scene } = useThree();

    useEffect(() => {
        scene.background = cubeMapTexture;
    }, [cubeMapTexture, scene]);
}

export default useSkybox;
