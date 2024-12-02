import { lazy, Suspense } from "react";
import { type ModelProps } from "./UnwrappedModel";


const UnwrappedModel = lazy(() => import("./UnwrappedModel"));


const Model = (props: ModelProps) => {
    return (
        <Suspense fallback={null}>
            <UnwrappedModel {...props} />
        </Suspense>
    );
};

export default Model;
