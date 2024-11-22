import "./index.css"
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IfInSessionMode, XR } from "@react-three/xr";
import { TrajectoriesContext, XRContext, TimeControlsContext, TrajectoriesContextType } from "../../contexts";
import { PerspectiveCamera } from "three";
import Orbit from "../Orbit";
import { CameraController, Skybox, SmallBodies, Sun } from "..";
import config from "../../globals/config.json";


enum ViewMode {
    normal,
    vr
}

extend({ OrbitControls });

const normalCamera = new PerspectiveCamera();
const xrCamera = new PerspectiveCamera();

function Scene() {
    const objects = useContext<TrajectoriesContextType>(TrajectoriesContext);
    const xrStore = useContext(XRContext);
    const { timeControls } = useContext(TimeControlsContext);
    const [mode, setMode] = useState<ViewMode>(ViewMode.normal);
    const [camera, setCamera] = useState<PerspectiveCamera>(normalCamera);
    const orbitControlsRef = useRef(null!);

    useEffect(() => {
        xrStore.subscribe((state, prevState) => {
            if (state.session !== undefined &&
                prevState.session === undefined
            ) {
                setMode(ViewMode.vr)
            } else if (state.session === undefined &&
                prevState.session !== undefined
            ) {
                setMode(ViewMode.normal)
            }
        });
        const handleResize = () => {
            normalCamera.aspect = window.innerWidth / window.innerHeight;
            normalCamera.updateProjectionMatrix();
            xrCamera.aspect = window.innerWidth / window.innerHeight;
            xrCamera.updateProjectionMatrix();
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [xrStore])

    useEffect(() => {
        setCamera(mode === ViewMode.normal ? normalCamera : xrCamera)
    }, [mode])

    useEffect(() => {
        camera.position.set(20, 20, 20);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
    }, [camera])

    const smallBodiesChunks = useMemo(() => {
        const chunks = []
        for (let i = 0; i < objects.smallBodies.length; i += config.smallBodies.chunkSize) {
            chunks.push(objects.smallBodies.slice(i, i + config.smallBodies.chunkSize))
        }
        return chunks
    }, [objects.smallBodies])

    const updateControls = useCallback(() => {
        if (!orbitControlsRef.current) return;
        orbitControlsRef.current.update()
    }, [orbitControlsRef])

    return (
        <>
            <Canvas
                style={{position: 'fixed', top: 0, left: 0}}
                camera={camera}
                dpr={window.devicePixelRatio}
                frameloop="demand">
                <XR store={xrStore}>
                    <ambientLight intensity={Math.PI / 2} />
                    <pointLight position={[0, 0, 0]} decay={0} intensity={Math.PI} />
                    <Sun />
                    {objects.planets.map(
                        (obj, i) => <Orbit
                            key={i.toString()}
                            trajectory={obj}
                            timestamp={timeControls.time} />
                    )}
                    {smallBodiesChunks.map((chunk) => <SmallBodies
                        key={chunk.map(obj => obj.id).join()}
                        trajectories={chunk}
                        timestamp={timeControls.time} />)}
                    <IfInSessionMode deny={['immersive-ar', 'immersive-vr']} >
                        <OrbitControls ref={orbitControlsRef}  enablePan={false} minDistance={1} maxDistance={400} camera={camera} />
                    </IfInSessionMode>
                    <CameraController
                        camera={camera}
                        updateCallback={updateControls}
                        controls={orbitControlsRef.current}
                        timestamp={timeControls.time} />
                </XR>
                {objects.planets ? <Skybox /> : <></>}
            </Canvas>
            {/*<button onClick={() => {xrStore.enterVR()}} className="enter-vr">Enter VR</button>*/}
        </>
    );
}

export default Scene;
