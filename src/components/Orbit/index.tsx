import * as THREE from 'three'
import React, { memo, useContext, useEffect, useMemo, useRef } from 'react'
import { Trajectory } from '../../types'
import { Html, Line } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { FocusContext } from '../../contexts';

interface OrbitProps {
    trajectory: Trajectory;
    datetime: Date;
}

const Orbit: React.FC<OrbitProps> = memo(({ trajectory, datetime }) =>{
    const constantSizeRef = useRef<THREE.Mesh>(null!)
    const { camera } = useThree()
    const { hovered } = useContext(FocusContext);

    useEffect(() => {
        const position = trajectory.propagateFromTime(datetime.getTime())
        constantSizeRef.current.position.set(position[0], position[1], position[2])
        const distance = constantSizeRef.current.position.distanceTo(camera.position);
        const scaleFactor = distance * 0.01;
        constantSizeRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }, [datetime])

    const hoveredToThis = useMemo(() => {
        return hovered.objectId === trajectory.id
    }, [trajectory, hovered])

    return <>
        {/* planet constant size mesh */}
        <mesh ref={constantSizeRef} onPointerOver={() => hovered.setObjectId(trajectory.id)} onPointerOut={() => hovered.setObjectId(null)}>
            <Html
                onPointerOver={() => hovered.setObjectId(trajectory.id)}
                onPointerOut={() => hovered.setObjectId(null)}
                className='trajectory-label'
                style={{
                    color: trajectory.color,
                    opacity: hoveredToThis ? 1 : 0.8,
                    transform: hoveredToThis ? 'translate(7px, -50%)' : 'translate(10px, -50%)',
                }}
            >{trajectory.name}</Html>
            <sphereGeometry args={[hoveredToThis ? .5 : .4, 32, 32]} />
            <meshBasicMaterial color={trajectory.color} opacity={0} />
        </mesh>

        {/* trajectory line */}
        <Line
            lineWidth={hoveredToThis ? 1.5 : 1}
            points={trajectory.points}
            color={trajectory.color}
            opacity={hoveredToThis ? 0.5 : 1}
        />
    </>
})

export default Orbit
