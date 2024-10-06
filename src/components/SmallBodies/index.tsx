import * as THREE from 'three'
import React, { memo, useEffect, useRef, useCallback } from 'react'
import { Trajectory } from '../../types'
import config from '../../globals/config.json'
import { Html } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { TrajectoryType } from '../../types/Trajectory';

interface SmallBodyOrbits {
    trajectories: Trajectory[];
    datetime: Date;
    hovered: string | null;
    setHovered: (hovered: string | null) => void;
    temp?: THREE.Object3D;
}

const Orbit: React.FC<SmallBodyOrbits> = memo(({ trajectories, datetime, hovered, setHovered, temp = new THREE.Mesh }) =>{
    const ref = useRef<THREE.InstancedMesh>(null!)

    useEffect(() => {
        trajectories.forEach((trajectory, i) => {
            const position = trajectory.propagateFromTime(datetime.getTime())
            const diameter = trajectory.diameter
            const scale = Math.min(Math.min(diameter, config.smallBodies.maxScale), config.smallBodies.minScale)
            temp.position.set(position[0], position[1], position[2])
            temp.scale.set(scale, scale, scale)
            temp.updateMatrix();
            ref.current.setMatrixAt(i, temp.matrix);
            if (trajectory.type === TrajectoryType.PHA) {
                ref.current.setColorAt(i, new THREE.Color('red'))
            } else if (trajectory.kind.startsWith('c')) {
                ref.current.setColorAt(i, new THREE.Color('lightblue'))
            }
        })
        ref.current.instanceMatrix.needsUpdate = true;
    }, [datetime])

    // const instanceIndexMap = useMemo(() => {
    //     const map = new Map<string, number>();
    //     trajectories.forEach((trajectory, i) => {
    //         map.set(trajectory.name, i);
    //     });
    //     return map;
    // }, [trajectories])

    const handleHover = useCallback((e: ThreeEvent<PointerEvent>) => {
        hovered;
        setHovered(e.instanceId?.toString() ?? null)
    }, [setHovered])

    const handleUnhover = useCallback((_: ThreeEvent<PointerEvent>) => {
        setHovered(null)
    }, [setHovered])

    return <>
        {/* planet constant size mesh */}
        <instancedMesh
            ref={ref}
            args={[undefined, undefined, trajectories.length]}>
            <Html
                onPointerOver={handleHover}
                onPointerOut={handleUnhover}
                style={{
                    fontSize: '12px',
                    userSelect: 'none',
                    textShadow: '0 0 100px black',
                    padding: 0,
                    margin: 0,
                    transform: 'translate(10px, -100%)',
                }}
            ></Html>
            <sphereGeometry args={[config.smallBodies.size, 32, 32]} />
            <meshBasicMaterial color="grey" />
        </instancedMesh>

        {/* trajectory line */}
        {/*<Line
            lineWidth={hovered ? 1.5 : 1}
            points={trajectory.points}
            color={trajectory.color}
            opacity={hovered ? 0.5 : 1}
        />*/}
    </>
})

export default Orbit
