import * as THREE from 'three'
import React, { memo, useEffect, useRef, useCallback, useMemo } from 'react'
import { Trajectory } from '../../types'
import config from '../../globals/config.json'
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { TrajectoryType } from '../../types/Trajectory';

interface SmallBodyOrbits {
    trajectories: Trajectory[];
    datetime: Date;
    hovered: string | null;
    setHovered: (hovered: string | null) => void;
    temp?: THREE.Object3D;
}

const SmallBodies: React.FC<SmallBodyOrbits> = memo(({ trajectories, datetime, hovered, setHovered }) =>{
    const geometryRef = useRef<THREE.BufferAttribute>(null!)
    const sizeRef = useRef<THREE.BufferAttribute>(null!)
    const materialRef = useRef<THREE.BufferAttribute>(null!)

    const calculateColors = useCallback(() => {
        const colors = new Float32Array(trajectories.map(t => {
            let colorCode = config.smallBodies.asteroidColor
            if (t.type === TrajectoryType.PHA) {
                colorCode = config.smallBodies.phaColor
            } else if (t.kind.startsWith('c')) {
                colorCode = config.smallBodies.cometColor
            }
            return colorCode
        }).flat())
        return colors
    }, [trajectories])

    const calculateSizes = useCallback(() => {
        const sizes = new Float32Array(trajectories.map(t => {
            return Math.max(Math.min(t.diameter / 1000, config.smallBodies.maxSize), config.smallBodies.minSize)
        }).flat())
        return sizes
    }, [trajectories])

    const calculatePositions = useCallback(() => {
        const positions = new Float32Array(trajectories.map(t => {
            return t.propagateFromTime(datetime.getTime())
        }).flat())
        return positions
    }, [trajectories, datetime])

    useEffect(() => {
        const colors = calculateColors()
        materialRef.current.array = colors
        const sizes = calculateSizes()
        sizeRef.current.array = sizes
        sizeRef.current.needsUpdate = true
    }, [trajectories])

    useFrame(() => {
        const positions = calculatePositions()
        geometryRef.current.array = positions
        geometryRef.current.needsUpdate = true
    })

    const { colors, sizes } = useMemo(() => {
        const colors = calculateColors()
        const sizes = calculateSizes()
        return { colors, sizes }
    }, [trajectories])

    const positions = useMemo(() => {
        return calculatePositions()
    }, [trajectories, datetime])

    const handleHover = useCallback((e: ThreeEvent<PointerEvent>) => {
        hovered;
        setHovered(e.instanceId?.toString() ?? null)
    }, [setHovered])

    const handleUnhover = useCallback((_: ThreeEvent<PointerEvent>) => {
        setHovered(null)
    }, [setHovered])

    return <>
    {/*
        <mesh>
            <bufferGeometry attach="geometry">
                <bufferAttribute attach='attributes-position' count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach='attributes-color' count={colors.length / 3} array={colors} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial vertexColors={true} />
        </mesh>
    */}
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach='attributes-position'
                    ref={geometryRef}
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3} />
                <bufferAttribute
                    attach='attributes-color'
                    ref={materialRef}
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3} />
                <bufferAttribute
                    attach='attributes-size'
                    ref={sizeRef}
                    count={positions.length / 3}
                    array={sizes}
                    itemSize={1} />
            </bufferGeometry>
            <shaderMaterial
                fragmentShader={`
                varying vec3 vColor;

                void main() {
                    float dist = length(gl_PointCoord - 0.5);

                    if (dist > 0.5) {
                        discard;
                    } else if (dist > 0.4) {
                        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                    } else {
                        gl_FragColor = vec4(vColor, 1.0);
                    }
                }
                `}
                vertexShader={`
                    attribute vec3 color;
                    varying vec3 vColor;
                    void main() {
                      vColor = color;
                      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                      gl_PointSize = 10.0;
                    }
                `} />
        </points>
    </>
})

export default SmallBodies
