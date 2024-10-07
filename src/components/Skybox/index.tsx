import * as THREE from "three";
import { extend, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect } from "react";

extend({ OrbitControls });

const Skybox = () => {
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


    return (
        <></>
    );
};

export default Skybox;
