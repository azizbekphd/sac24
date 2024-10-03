import { createXRStore, XR, XRStore } from "@react-three/xr";
import { ReactNode, useEffect } from "react";


function VrToggler({children, store}: {children: ReactNode, store: XRStore}) {
    return <XR store={store}>
        {children}
    </XR>
}

export default VrToggler;
