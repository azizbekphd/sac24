import { createContext } from "react";
import { Focus } from "../types";


interface FocusContextType {
    focus: Focus;
    setFocus: (focus: Focus) => void;
}

const FocusContext = createContext<FocusContextType>({
    focus: new Focus(),
    setFocus: (_: Focus) => {}
});

export default FocusContext;
export { type FocusContextType };
