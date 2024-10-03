import { createContext } from "react";
import { Trajectory } from "../types";

const TrajectoriesContext = createContext<Trajectory[]>([])

export default TrajectoriesContext;
