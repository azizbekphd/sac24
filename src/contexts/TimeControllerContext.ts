import { createContext } from "react";

interface TimeControlsState {
    time: number;
    deltaTime: number;
}

const TimeControlsContext = createContext<TimeControlsState>({
    time: new Date().getTime(),
    deltaTime: 1
});

export default TimeControlsContext;
