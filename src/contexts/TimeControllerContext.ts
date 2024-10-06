import { createContext } from "react";

interface TimeControlsState {
    time: number;
    live: boolean;
    deltaIndex: number;
    deltaTime: number;
}

interface TimeControlsContextType {
    timeControls: TimeControlsState;
    setTimeControls: (timeControls: TimeControlsState) => void;
}

const TimeControlsContext = createContext<TimeControlsContextType>({
    timeControls: {
        time: new Date().getTime(),
        live: true,
        deltaIndex: 0,
        deltaTime: 1
    },
    setTimeControls: () => {},
});

export default TimeControlsContext;
export { type TimeControlsState };
