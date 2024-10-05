import { createContext } from "react";

interface TimeControlsState {
    time: number;
    live: boolean;
    deltaIndex: number;
    deltaTime: number;
}

const TimeControlsContext = createContext<TimeControlsState>({
    time: new Date().getTime(),
    live: true,
    deltaIndex: 0,
    deltaTime: 1
});

export default TimeControlsContext;
export { type TimeControlsState };
