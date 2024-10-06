import * as THREE from 'three'
import React, { memo, useEffect, useMemo, useRef } from 'react'
import { Trajectory } from '../../types'
import { Html, Line } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

interface OrbitProps {
    trajectory: Trajectory;
    datetime: Date;
    hovered: string | null;
    setHovered: (hovered: string | null) => void;
}

const Orbit: React.FC<OrbitProps> = memo(({ trajectory, datetime, hovered, setHovered }) =>{
    const constantSizeRef = useRef<THREE.Mesh>(null!)
    const { camera } = useThree()

    useEffect(() => {
        const position = trajectory.propagateFromTime(datetime.getTime())
        constantSizeRef.current.position.set(position[0], position[1], position[2])
        const distance = constantSizeRef.current.position.distanceTo(camera.position);
        const scaleFactor = distance * 0.01;
        constantSizeRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }, [datetime])

    const hoveredToThis = useMemo(() => {
        return hovered === trajectory.id
    }, [trajectory, hovered])

    return <>
        {/* planet constant size mesh */}
        <mesh ref={constantSizeRef} onPointerOver={() => setHovered(trajectory.id)} onPointerOut={() => setHovered(null)}>
            <Html
                onPointerOver={() => setHovered(trajectory.id)}
                onPointerOut={() => setHovered(null)}
                style={{
                    transitionDuration: '0.2s',
                    color: trajectory.color,
                    fontSize: '12px',
                    textShadow: '0 0 100px black',
                    padding: 0,
                    margin: 0,
                    opacity: hoveredToThis ? 1 : 0.8,
                    transform: hoveredToThis ? 'translate(7px, -50%)' : 'translate(10px, -50%)',
                    zIndex: 5,
                    borderRadius: '5px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
