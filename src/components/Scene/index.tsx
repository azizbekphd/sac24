import "./index.css"
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IfInSessionMode, XR } from "@react-three/xr";
import { TrajectoriesContext, XRContext, TimeControlsContext, TrajectoriesContextType, FocusContext } from "../../contexts";
import { PerspectiveCamera } from "three";
import Orbit from "../Orbit";
import { CameraController, SmallBodies, Sun } from "..";
import config from "../../globals/config.json";

const Skybox = lazy(() => import("../Skybox/index.tsx"))

enum ViewMode {
    normal,
    vr
}

extend({ OrbitControls });

const normalCamera = new PerspectiveCamera(50, 1, 0.000001, 1000);
const xrCamera = new PerspectiveCamera(50, 1, 0.000001, 1000);

function Scene() {
    const objects = useContext<TrajectoriesContextType>(TrajectoriesContext);
    const xrStore = useContext(XRContext);
    const { timeControls } = useContext(TimeControlsContext);
    const [mode, setMode] = useState<ViewMode>(ViewMode.normal);
    const [camera, setCamera] = useState<PerspectiveCamera>(normalCamera);
    const orbitControlsRef = useRef(null!);
    const { hovered, selected } = useContext(FocusContext);

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

    const onPointerDown = useCallback(() => {
        if (hovered.objectId) {
            selected.setObjectId(hovered.objectId)
        }
    }, [hovered.objectId, selected])

    return (
        <>
            <Canvas
                style={{position: 'fixed', top: 0, left: 0}}
                camera={camera}
                dpr={window.devicePixelRatio}
                onPointerDown={onPointerDown}
                frameloop="demand">
                <XR store={xrStore}>
                    <ambientLight intensity={0.05} />
                    <pointLight position={[0, 0, 0]} decay={0} intensity={Math.PI} />
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
                        <OrbitControls ref={orbitControlsRef} enablePan={false} maxDistance={400} camera={camera} zoomSpeed={2} />
                    </IfInSessionMode>
                    <CameraController camera={camera} orbitControlsRef={orbitControlsRef} />
                    <Sun />
                    <Suspense fallback={null}>
                        <Skybox />
                    </Suspense>
                </XR>
            </Canvas>
            {/*<button onClick={() => {xrStore.enterVR()}} className="enter-vr">Enter VR</button>*/}
        </>
    );
}

export default Scene;
