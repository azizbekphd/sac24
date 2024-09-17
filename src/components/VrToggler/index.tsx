import { createXRStore, XR } from "@react-three/xr";
import { ReactNode, useEffect } from "react";

const store = createXRStore()

function VrToggler({children, vr}: {children: ReactNode, vr: boolean}) {
    useEffect(() => {
        if (vr) {
            store.enterVR()
        } else {
            store.getState().session?.end()
        }
    }, [vr])

    return <XR store={store}>
        {children}
    </XR>
}

export default VrToggler;
