import { lazy, Suspense } from "react";
import { type ModelProps } from "./UnwrappedModel";
import LoadingFallback from "./LoadingFallback";


const UnwrappedModel = lazy(() => import("./UnwrappedModel"));

const Model = ({loadingFallback = true, ...props}: ModelProps & { loadingFallback?: boolean }) => {
    return (
        <Suspense fallback={
            <LoadingFallback
                show={loadingFallback}
                position={props.position}
            />
        }>
            <UnwrappedModel
                {...props}
            />
        </Suspense>
    );
};

export default Model;
