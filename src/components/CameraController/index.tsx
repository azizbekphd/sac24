import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useMemo } from "react";
import { FocusContext, TrajectoriesContext } from "../../contexts";
import { OrbitControls } from 'three/examples/jsm/Addons.js';


interface CameraControllerProps {
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    updateCallback: () => void;
    timestamp: number;
}

const CameraController: React.FC<CameraControllerProps> = ({
    camera, updateCallback, controls, timestamp
}) => {
    const { selected } = useContext(FocusContext)
    const objects = useContext(TrajectoriesContext)
    const viewport = useThree((state) => state.viewport)

    const selectedObject = useMemo(() => {
        return objects.smallBodies.find(obj => obj.id === selected.objectId)
    }, [objects.smallBodies, selected.objectId])

    const targetPosition = useMemo(() => {
        let coords = [0, 0, 0]
        if (selectedObject) {
            coords = selectedObject.propagateFromTime(timestamp)
        }
        return new THREE.Vector3(coords[0], coords[1], coords[2])
    }, [selectedObject, timestamp])

    useEffect(() => {
        camera.aspect = viewport.width / viewport.height;
        camera.updateProjectionMatrix();
    }, [camera, viewport])

    // useEffect(() => {
    //     const startPosition = camera.position.clone();
    //     const startTarget = controls.target.clone();

    //     const targetDistance = 10;

    //     const direction = new THREE.Vector3().subVectors(camera.position, targetPosition).normalize();
    //     const newCameraPosition = targetPosition.clone().add(direction.multiplyScalar(targetDistance));

    //     new TWEEN.Tween(startPosition)
    //         .to(newCameraPosition, 1000)
    //         .easing(TWEEN.Easing.Quadratic.InOut)
    //         .onUpdate(() => {
    //             camera.position.copy(startPosition);
    //             controls.update();
    //         })
    //         .start();

    //     new TWEEN.Tween(startTarget)
    //         .to(targetPosition, 1000)
    //         .easing(TWEEN.Easing.Quadratic.InOut)
    //         .onUpdate(() => {
    //             controls.target.copy(startTarget);
    //             controls.update();
    //         })
    //         .start();
    // }, [camera, controls, targetPosition])

    useFrame(() => {
        controls?.update()
        TWEEN.update()
        updateCallback()
    })

    return <></>
}

export default CameraController
