import { createContext, useContext } from "react";
import type { GraphType } from "../../graphs/graphSlice";

export const GraphInfoContext = createContext<{
    id: string;
    type: GraphType;
}>({ id: "", type: "oriented" });

export const useGraphInfo = () => useContext(GraphInfoContext);
