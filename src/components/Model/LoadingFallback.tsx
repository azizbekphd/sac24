import * as THREE from "three";
import { Html } from "@react-three/drei"
import { Loading } from ".."


interface LoadingFallbackProps {
    show: boolean;
    position?: THREE.Vector3;
}

const LoadingFallback = ({ show, position = new THREE.Vector3(0, 0, 0) }: LoadingFallbackProps) => {
    return <>
        <mesh
            position={position}
        >
            <Html
                className='trajectory-label'
                style={{
                    color: 'white',
                    transform: 'translate(10px, -50%)',
                }}
            >
                <Loading show={show} />
            </Html>
        </mesh>
    </>
}

export default LoadingFallback;
