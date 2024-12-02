import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { FocusContext, TimeControlsContext, TrajectoriesContext } from '../../contexts';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { MathUtils } from '../../utils';
import { Coords } from '../../types';
import config from '../../globals/config.json';
import { TrajectoryType } from '../../types/Trajectory';


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
    const currentGoal = useRef<Coords>([0, 0, 0])

    const moveCamera = useCallback((
            target: {x: number, y: number, z: number},
            position: {x: number, y: number, z: number},
            immediate: boolean = false) => {
        if (immediate) {
            camera.position.set(position.x, position.y, position.z)
            orbitControlsRef.current?.target.set(target.x, target.y, target.z)
            orbitControlsRef.current?.update()
            return
        }
        const currentTarget = orbitControlsRef.current?.target
        const currentPosition = camera.position
        const tween = new TWEEN.Tween({target: {...currentTarget}, position: {...currentPosition}})
            .to({
                target: {x: target.x, y: target.y, z: target.z},
                position: {x: position.x, y: position.y, z: position.z}
            }, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(({target, position}) => {
                camera.position.set(position.x, position.y, position.z)
                orbitControlsRef.current?.target.set(target.x!, target.y!, target.z!)
                orbitControlsRef.current?.update()
            })
            .start()
        tweenGroup.current.add(tween)
    }, [orbitControlsRef, camera.position])

    const selectedObject = useMemo(() => {
        if (!selected.objectId) {
            return null
        }
        const allObjects = [...objects.planets, ...objects.smallBodies]
        const object = allObjects.find(obj => obj.id === selected.objectId)
        if (!object) {
            return null
        }
        return object
    }, [selected.objectId, objects])

    useEffect(() => {
        if (orbitControlsRef.current) {
            if (!selectedObject) {
                moveCamera({x: 0, y: 0, z: 0}, {x: 20, y: 20, z: 20})
                orbitControlsRef.current.minDistance = 0.1;
                return
            }
            const minDistance = selectedObject.scaleFactor *
                config.camera.scale * (selectedObject.type === TrajectoryType.Planet ? 3000 : 4000)
            orbitControlsRef.current.minDistance = minDistance
            const target = selectedObject.propagateFromTime(timeControls.time)
            const currentPosition = camera.position.clone()
            const directionVector = MathUtils.normalize([
                target[0] - currentPosition.x,
                target[1] - currentPosition.y,
                target[2] - currentPosition.z
            ])
            const position = directionVector.map((t, i) => target[i] - t * minDistance)
            moveCamera(
                {x: target[0], y: target[1], z: target[2]},
                {x: position[0], y: position[1], z: position[2]}
            )
        }
    }, [selectedObject, moveCamera])

    useEffect(() => {
        if (!selectedObject) return
        const target = selectedObject.propagateFromTime(timeControls.time)
        const delta = target.map((t, i) => t - currentGoal.current[i])
        currentGoal.current = [...target]
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
    }, [
        timeControls.time, selectedObject,
        orbitControlsRef, camera, moveCamera
    ])

    useFrame(() => {
        if (orbitControlsRef.current) {
            orbitControlsRef.current.update()
        }
        tweenGroup.current.update()
    })

    useEffect(() => {
        camera.aspect = viewport.width / viewport.height;
        camera.updateProjectionMatrix();
    }, [camera, viewport])

    return <></>
}

export default CameraController
