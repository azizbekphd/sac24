import { createContext } from "react";
import config from "../globals/config.json";

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
    timeControls: config.timeControls.default,
    setTimeControls: () => {},
});

export default TimeControlsContext;
export { type TimeControlsState };
