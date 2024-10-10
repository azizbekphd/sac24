import { createContext } from "react";


interface FocusItem {
    objectId: string;
    setObjectId: (objectId: string | null) => void;
}

interface FocusContextType {
    selected: FocusItem;
    hovered: FocusItem;
}

const FocusContext = createContext<FocusContextType>(null!);

export default FocusContext;
export { type FocusContextType };
