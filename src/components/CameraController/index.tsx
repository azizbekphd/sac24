import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { FocusContext, TimeControlsContext, TrajectoriesContext } from '../../contexts';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import config from '../../globals/config.json'


interface CameraControllerProps {
    camera: THREE.PerspectiveCamera;
    orbitControlsRef: React.MutableRefObject<OrbitControls | undefined>;
}

const CameraController: React.FC<CameraControllerProps> = ({
    camera, orbitControlsRef
}) => {
    const viewport = useThree((state) => state.viewport)
    const { selected } = useContext(FocusContext)
    const { timeControls } = useContext(TimeControlsContext)
    const objects = useContext(TrajectoriesContext)
    const tweenGroup = useRef<TWEEN.Group>(new TWEEN.Group())

    const moveCamera = useCallback((
            target: {x: number, y: number, z: number},
            position: {x: number, y: number, z: number},
            immediate: boolean = false) => {
        if (immediate) {
            camera.position.set(position.x, position.y, position.z)
            orbitControlsRef.current!.target.set(target.x, target.y, target.z)
            orbitControlsRef.current!.update()
            return
        }
        const currentTarget = orbitControlsRef.current!.target
        const currentPosition = camera.position
        const tween = new TWEEN.Tween({target: {...currentTarget}, position: {...currentPosition}})
            .to({
                target: {x: target.x, y: target.y, z: target.z},
                position: {x: position.x, y: position.y, z: position.z}
            }, 200)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(({target, position}) => {
                camera.position.set(position.x, position.y, position.z)
                orbitControlsRef.current!.target.set(target.x, target.y, target.z)
                orbitControlsRef.current!.update()
            })
            .start()
        tweenGroup.current.add(tween)
    }, [orbitControlsRef])

    const selectedObject = useMemo(() => {
        if (!selected.objectId) return
        const allObjects = [...objects.planets, ...objects.smallBodies]
        const object = allObjects.find(obj => obj.id === selected.objectId)
        if (!object) return
        return object
    }, [selected.objectId, objects])

    useEffect(() => {
        if (!selectedObject) {
            moveCamera({x: 0, y: 0, z: 0}, {x: 20, y: 20, z: 20})
            return
        }
        const target = selectedObject.propagateFromTime(timeControls.time)
        const position = target.map((t, i) => t + config.camera.offset[i])
        moveCamera(
            {x: target[0], y: target[1], z: target[2]},
            {x: position[0], y: position[1], z: position[2]}
        )
    }, [selectedObject, moveCamera])

    useEffect(() => {
        if (!selectedObject) return
        const target = selectedObject.propagateFromTime(timeControls.time)
        const timeStepsNumber = (config.timeControls.timeDeltas.length - 1) / 2
        const prevTarget = selectedObject.propagateFromTime(
            timeControls.time - config.timeControls.timeDeltas[timeControls.deltaIndex + timeStepsNumber].value * config.camera.tick
        )
        const delta = target.map((t, i) => t - prevTarget[i])
        const prevPosition = camera.position.clone()
        const position = [
            prevPosition.x + delta[0],
            prevPosition.y + delta[1],
            prevPosition.z + delta[2]
        ]
        moveCamera(
            {x: target[0], y: target[1], z: target[2]},
            {x: position[0], y: position[1], z: position[2]},
            true
        )
    }, [timeControls.time])

    useFrame(() => {
        orbitControlsRef.current!.update()
        tweenGroup.current.update()
    })

    useEffect(() => {
        camera.aspect = viewport.width / viewport.height;
        camera.updateProjectionMatrix();
    }, [camera, viewport])

    return <></>
}

export default CameraController
