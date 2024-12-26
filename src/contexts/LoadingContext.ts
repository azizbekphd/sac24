import { createContext } from "react";

interface LoadingContextType {
    state: {
        loading: boolean;
        fullScreen: boolean;
    };
    setState: (state: LoadingContextType['state']) => void;
}

const LoadingContext = createContext<LoadingContextType>({
    state: {
        loading: false,
        fullScreen: false,
    },
    setState: () => {},
})

export { type LoadingContextType };
export default LoadingContext;
