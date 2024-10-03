import { createContext } from "react";
import { Focus } from "../types";

const FocusContext = createContext<Focus>(new Focus());

export default FocusContext;
