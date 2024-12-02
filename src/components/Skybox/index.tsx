import * as THREE from "three";
import { useLoader, useThree } from "@react-three/fiber";
import { useEffect } from "react";

const Skybox = () => {
    const skyboxTextures = [
        "px",
        "nx",
        "py",
        "ny",
        "pz",
        "nz",
    ].map((t) => `/sac24/skybox/${t}.jpg`);
    const [cubeMapTexture] = useLoader<any, any, any>(THREE.CubeTextureLoader, [skyboxTextures]);
    const { scene } = useThree();

    useEffect(() => {
        scene.background = cubeMapTexture;
    }, [cubeMapTexture, scene]);


    return (
        <></>
    );
};

export default Skybox;
