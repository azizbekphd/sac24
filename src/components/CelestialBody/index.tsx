type CelestialBodyProps = {
    type: 'sun' | 'planet' | 'asteroid',
    position: [number, number, number],
    radius: number
}

function CelestialBody(props: CelestialBodyProps) {
    return <mesh>
        <sphereGeometry args={[props.radius]} />
    </mesh>
}

export default CelestialBody;
