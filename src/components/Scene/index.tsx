import "./index.css"
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PointerLockControls, Sky, Stats } from "@react-three/drei";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { IfInSessionMode, XR } from "@react-three/xr";
import { TrajectoriesContext, XRContext, TimeControlsContext } from "../../contexts";
import { PerspectiveCamera } from "three";
import Orbit from "../Orbit";
import { Trajectory } from "../../types";


enum ViewMode {
    normal,
    vr
}

function Scene() {
    const objects = useContext<Trajectory[]>(TrajectoriesContext);
    const xrStore = useContext(XRContext);
    const timeControls = useContext(TimeControlsContext);
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
    }, [])

    useEffect(() => {
        setCamera(mode === ViewMode.normal ? normalCamera : xrCamera)
        camera.position.set(20, 20, 20);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
    }, [mode])

    return (
        <>
            <Canvas camera={camera} dpr={window.devicePixelRatio}>
                <XR store={xrStore}>
                    <ambientLight intensity={Math.PI / 2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                    {objects.map(
                        (obj, i) => <Orbit key={i.toString()} trajectory={obj} datetime={new Date(timeControls.time)} />
                    )}
                    {mode === ViewMode.normal && <IfInSessionMode deny={['immersive-ar', 'immersive-vr']} >
                        <OrbitControls enablePan={false} maxZoom={1} minZoom={0.5} />
                    </IfInSessionMode>}
                    <axesHelper />
                </XR>
            </Canvas>
            <button onClick={() => {xrStore.enterVR()}} className="enter-vr">Enter VR</button>
        </>
    );
}

export default Scene;
