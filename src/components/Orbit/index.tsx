import * as THREE from 'three'
import React, { memo, useContext, useEffect, useMemo, useRef } from 'react'
import { Trajectory } from '../../types'
import { Html, Line } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { FocusContext } from '../../contexts';

interface OrbitProps {
    trajectory: Trajectory;
    timestamp: number;
}

const Orbit: React.FC<OrbitProps> = memo(({ trajectory, timestamp }) =>{
    const constantSizeRef = useRef<THREE.Mesh>(null!)
    const { camera } = useThree()
    const { hovered, selected } = useContext(FocusContext);

    useEffect(() => {
        const position = trajectory.propagateFromTime(timestamp)
        constantSizeRef.current.position.set(position[0], position[1], position[2])
        const distance = constantSizeRef.current.position.distanceTo(camera.position);
        const scaleFactor = distance * 0.01;
        constantSizeRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }, [timestamp])

    const highlight = useMemo(() => {
        return hovered.objectId === trajectory.id ||
            selected.objectId === trajectory.id
    }, [trajectory, hovered.objectId, selected.objectId])

    return <>
        {/* planet constant size mesh */}
        <mesh
            ref={constantSizeRef}
            onPointerOver={() => hovered.setObjectId(trajectory.id)}
            onPointerOut={() => hovered.setObjectId(null)}
            onPointerDown={() => hovered.setObjectId(trajectory.id)}
        >
            <Html
                onPointerOver={(e) => {
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
                className='trajectory-label'
                style={{
                    color: trajectory.color,
                    opacity: highlight ? 1 : 0.8,
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
