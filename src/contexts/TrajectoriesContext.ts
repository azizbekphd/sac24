import { createContext } from "react";
import { Trajectory } from "../types";


interface TrajectoriesContextType {
    planets: Trajectory[];
    smallBodies: Trajectory[];
}

const TrajectoriesContext = createContext<TrajectoriesContextType>({
    planets: [],
    smallBodies: [],
})

export default TrajectoriesContext;
export { type TrajectoriesContextType };
