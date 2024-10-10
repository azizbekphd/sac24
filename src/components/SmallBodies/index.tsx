import * as THREE from 'three'
import React, { memo, useEffect, useRef, useCallback, useMemo, useContext } from 'react'
import { Trajectory } from '../../types'
import config from '../../globals/config.json'
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { TrajectoryType } from '../../types/Trajectory';
import { FocusContext } from '../../contexts';
import { Html, Line } from '@react-three/drei';
import './index.css'

interface SmallBodyOrbits {
    trajectories: Trajectory[];
    datetime: Date;
    temp?: THREE.Object3D;
}

const SmallBodies: React.FC<SmallBodyOrbits> = memo(({ trajectories, datetime }) =>{
    const geometryRef = useRef<THREE.BufferAttribute>(null!)
    const sizeRef = useRef<THREE.BufferAttribute>(null!)
    const materialRef = useRef<THREE.BufferAttribute>(null!)
    const { hovered } = useContext(FocusContext);
    const hoveredLabelRef = useRef<THREE.Mesh>(null!)

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
            const diameter = t.id === hovered.objectId ? 10 : t.diameter
            return Math.max(Math.min(
                diameter / 1000,
                config.smallBodies.maxSize), config.smallBodies.minSize)
        }).flat())
        return sizes
    }, [trajectories, hovered.objectId])

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
    }, [trajectories, hovered.objectId])

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

    const hoveredParams = useMemo(() => {
        const index = trajectories.findIndex(t => t.id === hovered.objectId)
        if (index === -1) return null
        const trajectory = trajectories[index]
        const color = new THREE.Color(...colors.slice(index * 3, index * 3 + 3).map(c => c * 256)).getHex()
        const position = new THREE.Vector3(...positions.slice(index * 3, index * 3 + 3))
        return {
            name: trajectory.name,
            points: trajectory.points,
            position,
            color
        }
    }, [trajectories, hovered.objectId])

    useFrame(() => {
        if (hoveredLabelRef.current) {
            const index = trajectories.findIndex(t => t.id === hovered.objectId)
            const position = new THREE.Vector3(...positions.slice(index * 3, index * 3 + 3))
            hoveredLabelRef.current.position.set(position.x, position.y, position.z)
        }
    })

    const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        const index = e.intersections.sort((a, b) => a.distanceToRay! - b.distanceToRay!)[0].index!
        hovered.setObjectId(trajectories[index].id)
    }, [])

    const handlePointerOut = useCallback((e: any) => {
        e.stopPropagation()
        hovered.setObjectId(null)
    }, [])

    return <>
        <points
            onPointerMove={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
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


        {/* trajectory line for hovered object */}
        {hoveredParams &&
            <Line
                lineWidth={1}
                points={hoveredParams.points}
                color={hoveredParams.color}
                opacity={1}
            />
        }
        {/* body name */}
        {hoveredParams &&
            <mesh ref={hoveredLabelRef} position={hoveredParams.position}>
                <Html
                    className='trajectory-label'
                    style={{
                        color: hoveredParams.color.toString(),
                        opacity: 1,
                        transform: 'translate(10px, -50%)',
                    }}
                >{hoveredParams.name}</Html>
            </mesh>
        }
    </>
})

export default SmallBodies
