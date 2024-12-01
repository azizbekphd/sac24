import * as THREE from 'three'
import React, { memo, useContext, useEffect, useMemo, useRef } from 'react'
import { Trajectory } from '../../types'
import { Html, Line } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { FocusContext, TimeControlsContext } from '../../contexts';
import Model from '../Model';
import config from '../../globals/config.json';
import { SUN_DIAMETER } from '../../globals/constants';


interface OrbitProps {
    trajectory: Trajectory;
    timestamp: number;
}

const Orbit: React.FC<OrbitProps> = memo(({ trajectory, timestamp }) =>{
    const constantSizeRef = useRef<THREE.Mesh>(null!)
    const { camera } = useThree()
    const { hovered, selected } = useContext(FocusContext);
    const { timeControls } = useContext(TimeControlsContext)

    const position = useMemo(() => {
        return trajectory.propagateFromTime(timestamp)
    }, [trajectory, timestamp])

    useEffect(() => {
        constantSizeRef.current.position.set(position[0], position[1], position[2])
        const distance = constantSizeRef.current.position.distanceTo(camera.position);
        const scaleFactor = distance * 0.01;
        constantSizeRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }, [
        camera.position, camera.scale, camera.zoom,
        position, timeControls.deltaTime
    ])

    const highlight = useMemo(() => {
        return hovered.objectId === trajectory.id ||
            selected.objectId === trajectory.id
    }, [trajectory, hovered.objectId, selected.objectId])

    return <>
        {/* planet model */}
        {selected.objectId === trajectory.id &&
            <Model
                source={trajectory.model}
                position={new THREE.Vector3(...position)}
                scale={trajectory.scaleFactor}
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
            onPointerDown={() => selected.setObjectId(trajectory.id)}
        >
            <Html
                onPointerMove={(e) => {
                    e.stopPropagation()
                    hovered.setObjectId(trajectory.id)
                }}
                onPointerOut={(e) => {
                    e.stopPropagation()
                    hovered.setObjectId(null)
                }}
                onClick={(e) => {
                    e.stopPropagation()
                    hovered.setObjectId(trajectory.id)
                }}
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
