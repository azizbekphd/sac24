import { Canvas, useFrame } from "@react-three/fiber";
import { SpaceObject } from "../../classes";
import { Sky } from "@react-three/drei";
import { useRef, useState } from "react";
import VrToggler from "../VrToggler";

function Box(props: any) {
    // This reference will give us direct access to the mesh
    const meshRef = useRef()
        // Set up state for the hovered and active state
        const [hovered, setHover] = useState(false)
        const [active, setActive] = useState(false)
        // Subscribe this component to the render-loop, rotate the mesh every frame
        useFrame((_, delta) => {
            if (meshRef.current !== undefined) {
                meshRef.current.rotation.x += delta
            }
        })
        // Return view, these are regular three.js elements expressed in JSX
        return (
                <mesh
                {...props}
                ref={meshRef}
                scale={active ? 1.5 : 1}
                onClick={(_) => setActive(!active)}
                onPointerOver={(_) => setHover(true)}
                onPointerOut={(_) => setHover(false)}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
                </mesh>
               )
}

function Scene({objects, vr}: {objects: SpaceObject, vr: boolean}) {
    return <Canvas>
        <VrToggler vr={vr}>
            {(vr && objects) ? <Sky sunPosition={[100, 20, 100]} /> : <></>}
            <ambientLight intensity={Math.PI / 2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            <Box position={[-1.2, 0, 0]} />
            <Box position={[1.2, 0, 0]} />
        </VrToggler>
    </Canvas>
}

export default Scene;
