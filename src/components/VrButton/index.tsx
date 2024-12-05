import { XRStore } from "@react-three/xr";
import { ReactNode } from "react";
import "./index.css"

type VrButtonProps = {
    children?: ReactNode;
    store: XRStore;
}

const VrButton = ({ store }: VrButtonProps) => {
    return <>
        <button className="enter-vr" onClick={() => store.enterVR()}>VR</button>
    </>
}

export default VrButton;
