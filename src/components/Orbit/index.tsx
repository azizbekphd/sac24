import * as THREE from 'three'
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { Trajectory } from '../../types'
import { Html, Line } from '@react-three/drei';
import { ThreeEvent, useThree } from '@react-three/fiber';
import { FocusContext, TimeControlsContext } from '../../contexts';
import Model from '../Model';


interface OrbitProps {
    trajectory: Trajectory;
    timestamp: number;
}

const Orbit: React.FC<OrbitProps> = memo(({ trajectory, timestamp }) =>{
    const constantSizeRef = useRef<THREE.Mesh>(null!)
    const { camera } = useThree()
    const { hovered, selected } = useContext(FocusContext);
    const { timeControls } = useContext(TimeControlsContext)
    const clickCoords = useRef<{x: number, y: number}>(null!)

    const position = useMemo(() => {
        return trajectory.propagateFromTime(timestamp)
    }, [trajectory, timestamp])

    useEffect(() => {
        const distance = constantSizeRef.current.position.distanceTo(camera.position);
        constantSizeRef.current.position.set(position[0], position[1], position[2])

        const mm = 100;
        const canvasHeight = window.innerHeight;
        const mmToMeters = mm / 1000;
        const fovInRadians = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
        const visibleHeight = 2 * Math.tan(fovInRadians / 2) * distance;
        const pixelHeightInWorldUnits = visibleHeight / canvasHeight;
        const worldUnits = mmToMeters / pixelHeightInWorldUnits;
        const scaleFactor = 1 / worldUnits;

        constantSizeRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }, [
        camera, position, timeControls.deltaTime,
        trajectory.id, selected.objectId
    ])

    const highlight = useMemo(() => {
        return hovered.objectId === trajectory.id ||
            selected.objectId === trajectory.id
    }, [trajectory, hovered.objectId, selected.objectId])

    const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent> | any) => {
        e.stopPropagation()
        clickCoords.current = {x: e.clientX, y: e.clientY}
    }, [])

    const handlePointerUp = useCallback((e: ThreeEvent<PointerEvent> | any) => {
        e.stopPropagation()
        if (Math.sqrt((clickCoords.current.x - e.clientX) ^ 2 + (clickCoords.current.y - e.clientY) ^ 2) < 10) {
            if (hovered.objectId) {
                selected.setObjectId(hovered.objectId)
                return
            }
            const index = (e.intersections ?? [e.intersection] ?? [])
                .sort((a: THREE.Intersection, b: THREE.Intersection) => a.distanceToRay! - b.distanceToRay!)[0].index!
            if (index === -1) return false
            selected.setObjectId(trajectory.id)
        }
    }, [trajectory.id, hovered.objectId, selected])


    return <>
        {/* planet model */}
        {(selected.objectId === trajectory.id) && trajectory.model &&
            <Model
                source={trajectory.model}
                position={new THREE.Vector3(...position)}
                scale={trajectory.scaleFactor}
                rotation={trajectory.calculateRotation(timeControls.time)}
            />
        }

        {/* planet constant size mesh */}
        <mesh
            ref={constantSizeRef}
            onPointerMove={(e) => {
                e.stopPropagation()
                hovered.setObjectId(trajectory.id)
            }}
            onPointerOut={() => hovered.setObjectId(null)}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        >
            <Html
                onPointerMove={() => {
                    hovered.setObjectId(trajectory.id)
                }}
                onPointerOut={() => {
                    hovered.setObjectId(null)
                }}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                className={[
                    'trajectory-label',
                    highlight ? 'highlight' : '',
                    highlight && camera.position.distanceTo(new THREE.Vector3(...position)) < trajectory.scaleFactor * 5 ? 'hide' : ''
                ].join(' ')}
                style={{
                    color: trajectory.color,
                    transform: highlight ? 'translate(7px, -50%)' : 'translate(10px, -50%)',
                }}
            >{trajectory.name}</Html>
            <sphereGeometry args={[highlight ? .5 : .4, 32, 32]} />
            <meshBasicMaterial color={trajectory.color} opacity={0} />
        </mesh>

        {/* trajectory line */}
        <Line
            lineWidth={highlight ? 1.5 : 1}
            points={trajectory.points}
            color={trajectory.color}
            opacity={highlight ? 0.5 : 1}
        />
    </>
})

export default Orbit
