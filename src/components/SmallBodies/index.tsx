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
    timestamp: number;
    temp?: THREE.Object3D;
}

const SmallBodies: React.FC<SmallBodyOrbits> = memo(({ trajectories, timestamp }) =>{
    const geometryRef = useRef<THREE.BufferAttribute>(null!)
    const sizeRef = useRef<THREE.BufferAttribute>(null!)
    const materialRef = useRef<THREE.BufferAttribute>(null!)
    const { hovered, selected } = useContext(FocusContext);
    const hoveredLabelRef = useRef<THREE.Mesh>(null!)
    const selectedLabelRef = useRef<THREE.Mesh>(null!)
    const drawableTrajectories = useMemo(() => {
        return trajectories.filter(t => {
            return !isNaN(t.oE) && !isNaN(t.epochMeanAnomaly) && !isNaN(t.period)
        })
    }, [trajectories])

    const calculateColors = useCallback(() => {
        const colors = new Float32Array(drawableTrajectories.map(t => {
            let colorCode = config.smallBodies.asteroidColor
            if (t.type === TrajectoryType.PHA) {
                colorCode = config.smallBodies.phaColor
            } else if (t.kind.startsWith('c')) {
                colorCode = config.smallBodies.cometColor
            }
            return colorCode
        }).flat())
        return colors
    }, [drawableTrajectories])

    const calculateSizes = useCallback(() => {
        const sizes = new Float32Array(drawableTrajectories.map(t => {
            const diameter = t.id === hovered.objectId ? 10 : t.diameter
            return Math.max(Math.min(
                diameter / 1000,
                config.smallBodies.maxSize), config.smallBodies.minSize)
        }).flat())
        return sizes
    }, [drawableTrajectories, hovered.objectId])

    const calculatePositions = useCallback(() => {
        const positions = new Float32Array(drawableTrajectories.map(t => {
            return t.propagateFromTime(timestamp)
        }).flat())
        return positions
    }, [drawableTrajectories, timestamp])

    useEffect(() => {
        const colors = calculateColors()
        materialRef.current.array = colors
        const sizes = calculateSizes()
        sizeRef.current.array = sizes
        sizeRef.current.needsUpdate = true
    }, [drawableTrajectories, hovered.objectId, calculateSizes, calculateColors])

    useFrame(() => {
        const positions = calculatePositions()
        geometryRef.current.array = positions
        geometryRef.current.needsUpdate = true
    })

    const { colors, sizes } = useMemo(() => {
        const colors = calculateColors()
        const sizes = calculateSizes()
        return { colors, sizes }
    }, [calculateColors, calculateSizes])

    const positions = useMemo(() => {
        return calculatePositions()
    }, [calculatePositions])

    const getParamsById = useCallback((objectId: string) => {
        const index = drawableTrajectories.findIndex(t => t.id === objectId)
        if (index === -1) return null
        const trajectory = drawableTrajectories[index]
        if (isNaN(trajectory.oE) || isNaN(trajectory.epochMeanAnomaly) || isNaN(trajectory.period)) {
            return null
        }
        const color = `#${new THREE.Color(...colors.slice(index * 3, index * 3 + 3).map(c => c * 255)).getHexString()}`
        const position = positions.slice(index * 3, index * 3 + 3)
        return {
            name: trajectory.name,
            points: trajectory.points,
            position,
            color
        }
    }, [drawableTrajectories, colors, positions])

    const hoveredParams = useMemo(() => {
        return getParamsById(hovered.objectId)
    }, [hovered.objectId, getParamsById])

    const selectedParams = useMemo(() => {
        return getParamsById(selected.objectId)
    }, [selected.objectId, getParamsById])

    useFrame(() => {
        if (hoveredLabelRef.current) {
            const index = drawableTrajectories.findIndex(t => t.id === hovered.objectId)
            const position = new THREE.Vector3(...positions.slice(index * 3, index * 3 + 3))
            hoveredLabelRef.current.position.set(position.x, position.y, position.z)
        }

        if (selectedLabelRef.current) {
            const index = drawableTrajectories.findIndex(t => t.id === selected.objectId)
            const position = new THREE.Vector3(...positions.slice(index * 3, index * 3 + 3))
            selectedLabelRef.current.position.set(position.x, position.y, position.z)
        }
    })

    const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        const index = e.intersections.sort((a, b) => a.distanceToRay! - b.distanceToRay!)[0].index!
        if (index === -1) return false
        hovered.setObjectId(drawableTrajectories[index].id)
    }, [drawableTrajectories, hovered])

    const handlePointerOut = useCallback((e: any) => {
        e.stopPropagation()
        hovered.setObjectId(null)
    }, [hovered])

    const handleClick = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        if (hovered.objectId) {
            selected.setObjectId(hovered.objectId)
            return
        }
        const index = e.intersections.sort((a, b) => a.distanceToRay! - b.distanceToRay!)[0].index!
        if (index === -1) return false
        selected.setObjectId(drawableTrajectories[index].id)
    }, [drawableTrajectories, hovered.objectId, selected])

    return <>
        <points
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onPointerDown={handleClick}
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
        {hoveredParams && hovered.objectId !== selected.objectId &&
            <Line
                lineWidth={1}
                points={hoveredParams.points}
                color={hoveredParams.color}
                opacity={1}
            />
        }
        {/* body name for hovered object */}
        {hoveredParams && hovered.objectId !== selected.objectId &&
            <mesh ref={hoveredLabelRef} position={new THREE.Vector3(...hoveredParams.position)}>
                <Html
                    className='trajectory-label'
                    style={{
                        color: hoveredParams.color,
                        opacity: 0.8,
                        zIndex: '7',
                        transform: 'translate(10px, -50%)',
                    }}
                >{hoveredParams.name}</Html>
            </mesh>
        }


        {/* trajectory line for selected object */}
        {selectedParams &&
            <Line
                lineWidth={1.5}
                points={selectedParams.points}
                color={selectedParams.color}
                opacity={1}
            />
        }
        {/* body name for selected object */}
        {selectedParams &&
            <mesh ref={selectedLabelRef} position={new THREE.Vector3(...selectedParams.position)}>
                <Html
                    className='trajectory-label'
                    style={{
                        fontSize: '13px',
                        color: selectedParams.color,
                        opacity: 1,
                        zIndex: '6',
                        transform: 'translate(10px, -50%)',
                    }}
                >{selectedParams.name}</Html>
            </mesh>
        }
    </>
})

export default SmallBodies
