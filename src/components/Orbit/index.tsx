import * as THREE from 'three'
import React, { memo, useMemo, useRef } from 'react'
import { Trajectory } from '../../types'
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

interface OrbitProps {
    trajectory: Trajectory;
    datetime: Date;
}

const Orbit: React.FC<OrbitProps> = ({ trajectory, datetime }) =>{
    const ref = useRef<THREE.Mesh>(null!)

    useFrame(({ clock }) => {
        const position = trajectory.propagate(trajectory.getTrueAnomaly(datetime.getTime()))
        ref.current.position.set(position[0], position[1], position[2])
    })

    return <>
        {/* planet mesh */}
        <mesh ref={ref}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshBasicMaterial color={trajectory.color} />
        </mesh>

        {/* trajectory line */}
        <Line
            lineWidth={1}
            points={trajectory.points}
            color={trajectory.color}
        />
    </>
}

export default Orbit
