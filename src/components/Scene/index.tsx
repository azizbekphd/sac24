import "./index.css"
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useContext, useEffect, useMemo, useState } from "react";
import { IfInSessionMode, XR } from "@react-three/xr";
import { TrajectoriesContext, XRContext, TimeControlsContext, TrajectoriesContextType } from "../../contexts";
import { PerspectiveCamera } from "three";
import Orbit from "../Orbit";
import { Skybox, SmallBodies, Sun } from "..";
import config from "../../globals/config.json";


enum ViewMode {
    normal,
    vr
}

extend({ OrbitControls });

function Scene() {
    const objects = useContext<TrajectoriesContextType>(TrajectoriesContext);
    const xrStore = useContext(XRContext);
    const { timeControls } = useContext(TimeControlsContext);
    const normalCamera = new PerspectiveCamera();
    const xrCamera = new PerspectiveCamera();
    const [mode, setMode] = useState<ViewMode>(ViewMode.normal);
    const [camera, setCamera] = useState<PerspectiveCamera>(normalCamera);

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
    }, [])

    useEffect(() => {
        setCamera(mode === ViewMode.normal ? normalCamera : xrCamera)
        camera.position.set(20, 20, 20);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
    }, [mode])

    const smallBodiesChunks = useMemo(() => {
        const chunks = []
        for (let i = 0; i < objects.smallBodies.length; i += config.smallBodies.chunkSize) {
            chunks.push(objects.smallBodies.slice(i, i + config.smallBodies.chunkSize))
        }
        return chunks
    }, [objects.smallBodies])

    return (
        <>
            <Canvas
                style={{position: 'fixed', top: 0, left: 0}}
                camera={camera}
                dpr={window.devicePixelRatio}
                frameloop="demand">
                <XR store={xrStore}>
                    <ambientLight intensity={Math.PI / 2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                    <Sun />
                    {objects.planets.map(
                        (obj, i) => <Orbit
                            key={i.toString()}
                            trajectory={obj}
                            datetime={new Date(timeControls.time)} />
                    )}
                    {smallBodiesChunks.map((chunk) => <SmallBodies
                        key={chunk.map(obj => obj.id).join()}
                        trajectories={chunk}
                        datetime={new Date(timeControls.time)} />)}
                    <IfInSessionMode deny={['immersive-ar', 'immersive-vr']} >
                        <OrbitControls enablePan={false} minDistance={1} maxDistance={200} camera={camera} />
                    </IfInSessionMode>
                </XR>
                {objects.planets ? <Skybox /> : <></>}
            </Canvas>
            {/*<button onClick={() => {xrStore.enterVR()}} className="enter-vr">Enter VR</button>*/}
        </>
    );
}

export default Scene;
